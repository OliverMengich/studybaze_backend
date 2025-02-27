/* eslint-disable prettier/prettier */
import { Args, Mutation, Query } from '@nestjs/graphql';
import { Document } from 'src/models/document.model';
import { PrismaService } from 'src/prisma.service';
import { UploadDocumentDto } from 'src/resolvers/dto/document/upload-document.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
// import * as path from 'path';
import { fromPath } from 'pdf2pic';
import { Readable } from 'stream';
import { CurrentAdmin, extractLastTwoItems, uploadDocumentToAzure } from 'src/utils';
export class DocumentResolver{
    constructor(private prismaService: PrismaService) {}

    @Query(() => [Document])
    getDocuments(@CurrentAdmin() admin: {name: string}){
        console.log('====================================');
        console.log(admin);
        console.log('====================================');
        return this.prismaService.document.findMany({
            select:{
                createdAt: true,
                preview_path: true,
                id: true,
                price: true,
                pages: true,
                thumbnail_image: true,
                rating: true,
                _count:{
                    select:{
                        users: true,
                    }
                },
                title: true,
                updatedAt: true,
            }
        });
    }

    @Mutation(() => Document)
    async uploadDocument(@Args('body') body: UploadDocumentDto){
        try {
            const {categoryId,document,price, title} = body
            const { createReadStream, filename, mimetype, } = document;
            const stream = createReadStream();
            const fileBuffer = await this.streamToBuffer(stream);

            // 1. Check if it's a document
            if (mimetype.includes('pdf')) {
                throw new HttpException('Only PDF documents are allowed',400)
            }

            // 2. Save the original document
            const uniqueFilename = `${Date.now()}-${filename}`;
            const filePath = await uploadDocumentToAzure(fileBuffer,uniqueFilename, uniqueFilename)
            // Extract the last two segments
            const {fileName,secondLastSegment} = extractLastTwoItems(filePath)
            const BACKEND_SERVER = process.env.BACKEND_SERVER
            const documentPath = `${BACKEND_SERVER}/uploads/${secondLastSegment}/${fileName}`;
    
            // 3. Extract metadata and generate thumbnail
            const pdfData = await this.generateThumbnail(filePath,uniqueFilename,uniqueFilename+'-thumbnail');
            const thumbnailItem = extractLastTwoItems(pdfData.thumbnailUrl);
            const thumbnailUrl = `${BACKEND_SERVER}/uploads/${thumbnailItem.secondLastSegment}/${thumbnailItem.fileName}`;
            // 4. Extract first 5 pages to create a new document
            const previewPath = await this.createPreviewDocument(filePath,uniqueFilename, uniqueFilename+'-preview',body.noOfPagesToShow);
            const items = extractLastTwoItems(previewPath);
            const previewPathUrl = `${BACKEND_SERVER}/uploads/${items.secondLastSegment}/${items.fileName}`;
            // 5. Save the document in the server.
            // 6. Create a proxy where you serve the files so that you can check who owns and who doesn't own the file, then serv
            const savedDocument = await this.prismaService.document.create({
                data:{
                    document_path: documentPath,
                    downloadsCount:0,
                    pages: pdfData.numberOfPages,
                    preview_path: previewPathUrl,
                    price,
                    rating:0,
                    thumbnail_image: thumbnailUrl,
                    title,
                    categoryId,
                }
            })
            return savedDocument
        } catch (error) {
            throw new HttpException(error.message, 400)
        }
        // 3. In upload server, create folder with that holds preview document, thumbnail and  document path itself
        // 4. In upload server, restrict access of the document to unauthorized users
    }

    @Query(() => Document,{nullable: true})
    async getDocumentById(@Args('id',{type: ()=>String}) id: string, ){
        return await this.prismaService.document.findUnique({
            where:{
                id: id,
            }
        });
    }

    @Mutation(() => Document)
    deleteDocument(@Args('id',{type: ()=>String}) id: string, ){
        //delete document from the storage first
        return this.prismaService.document.delete({
            where:{
                id: id,
            }
        });
    }

    @Mutation(()=>Document)
    async purchaseDocument(@Args('id',{type:()=>String}) id: string){
        const document = await this.prismaService.document.findUnique({
            where:{
                id,
            }
        });
        if (!document) {
            throw new HttpException('Document not found',HttpStatus.NOT_FOUND)
        }
    }

    private async saveFile(stream: NodeJS.ReadableStream, destination: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(destination);
            stream.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    }

    private async streamToBuffer(stream: Readable): Promise<Buffer> {
        return new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks)));
          stream.on("error", (err) => reject(err));
        });
    }
    
    private async generateThumbnail(filePath: string,folder_name: string,filename: string) {
        const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));
        const numberOfPages = pdfDoc.getPageCount();

        // const outputDir = this.storagePath;
        const outputFilename = filename + ".png";
        // const outputPath = path.join(outputDir, outputFilename);
        const convert = fromPath(filePath,{
            density: 100,
            saveFilename: outputFilename,
            savePath: './temp',
            format: "png",
            width: 600,
            height: 600
        })
        const result = await convert(1)
        if (!result.path) {
            throw new HttpException('Could not save document',400)
        }
        const imageBuffer = fs.readFileSync(result.path);
        const uploadImageUrl = await uploadDocumentToAzure(imageBuffer,folder_name,outputFilename)
        fs.unlinkSync(result.path);
        return {
            numberOfPages,
            thumbnailUrl: uploadImageUrl
        };
    }
    
    private async createPreviewDocument(filePath: string,folder_name: string, fileName: string,noOfPagesToShow: number){
        const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));
        const newPdfDoc = await PDFDocument.create();
        
        const numPages = pdfDoc.getPageCount();
        const pagesToExtract = Math.min(noOfPagesToShow, numPages);
        
        for (let i = 0; i < pagesToExtract; i++) {
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
            newPdfDoc.addPage(copiedPage);
        }
        const newPdfBytes = Buffer.from(await newPdfDoc.save());
        
        const previewUrl = await uploadDocumentToAzure(newPdfBytes,folder_name,fileName);
        return previewUrl;
    }
}