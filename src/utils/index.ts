/* eslint-disable prettier/prettier */
import { BlobServiceClient } from '@azure/storage-blob';
import * as bcrypt from 'bcrypt';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentAdmin = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.admin;
});
export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
});
export const uploadDocumentToAzure = async (file: Buffer,folder_name: string, file_name:string) => {
    const randomnumber = Math.floor(Math.random() * 1000000 + 1);
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURESTORAGE_CONNECTION_STRING,
    );
    const fileExtension = file_name.split('.').pop();
    const fileName = `${file_name}_${randomnumber.toString()}.${fileExtension}`;
    
    const containerClient = blobServiceClient.getContainerClient(file_name);
    await containerClient.createIfNotExists({});
    await containerClient.setAccessPolicy('container',[
        {
            accessPolicy: {
                expiresOn: new Date(new Date().valueOf() + 86400),
                permissions: 'r'
            },
            id: 'r',
        }
    ]);
    
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(file);
    return blockBlobClient.url;
}

export const compareFunc = async (hashedPassword: string,passedPassword: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(passedPassword, hashedPassword);
    return isMatch;
};
export const hashingFunc = async (password: string) => {
    return await bcrypt.hash(password, 10);
};
export const extractLastTwoItems = (path: string)=>{
    const urlParts = path.split('/');
    const fileName = urlParts.pop();
    const secondLastSegment = urlParts.pop();
    return {fileName, secondLastSegment}
}