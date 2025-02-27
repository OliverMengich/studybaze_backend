/* eslint-disable prettier/prettier */
import { NestMiddleware, UnauthorizedException } from "@nestjs/common";
import {Request, Response, NextFunction} from 'express'
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import axios from "axios";
export class AuthMiddleware implements NestMiddleware{
    constructor(private jwtService: JwtService,private prismaService: PrismaService){}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async use(req: Request, res: Response, _next: NextFunction) {
        try {
            // Extract token from headers
            if(req.path.includes('thumbnail.png') || req.path.includes('preview')){
                console.log(req.path)
                const urlParts = req.path.split('/');
                const fileName = urlParts.pop(); 
                const secondLastSegment = urlParts.pop();
                const externalFileUrl = `${process.env.UPLOAD_BASE_URL}/${secondLastSegment}/${fileName}`;
                const response = await axios.get(externalFileUrl, { responseType: "stream" });
                return response.data.pipe(res);
            }
            const authHeader = req.headers.authorization;
            if (!authHeader) throw new UnauthorizedException("No token provided");

            const token = authHeader.split(" ")[1]; // Format: Bearer <token>
            if (!token) throw new UnauthorizedException("Invalid token format");

            // Verify token and get user data
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.SUPER_ADMIN_KEY,
            });
            if (!decoded || !decoded.userId) throw new UnauthorizedException("Invalid token");

            const userId = decoded.userId;
            // check if user has access to this document
            const user_access = await this.prismaService.document.findFirst({
                where:{
                    document_path: req.path,
                    users:{
                        some:{
                            id: userId
                        }
                    }
                }
            });
            if(!user_access) throw new UnauthorizedException("Invalid token");
            // Extract requested file path
            const urlParts = req.path.split('/');
            const fileName = urlParts.pop(); 
            const secondLastSegment = urlParts.pop();
            const externalFileUrl = `${process.env.UPLOAD_BASE_URL}/${secondLastSegment}/${fileName}`;
            console.log('====================================');
            console.log("request path: ", req.path);
            console.log("external file url: ",externalFileUrl);
            console.log(fileName,"\n",secondLastSegment);
            console.log('====================================');
            const response = await axios.get(externalFileUrl, { responseType: "stream" });
            // Set the correct content type
            res.setHeader("Content-Type", response.headers["content-type"]);
            
            return response.data.pipe(res);
        } catch (error) {
            return res.status(401).json({ message: error.message || "Unauthorized" });
        }
    }

}