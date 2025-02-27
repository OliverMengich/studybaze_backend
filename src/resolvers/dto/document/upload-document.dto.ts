/* eslint-disable prettier/prettier */
import { InputType, Field } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";

@InputType()
export class UploadDocumentDto{

    @Field()
    title: string

    @Field()
    price: number

    @Field()
    categoryId: string
    
    @Field()
    noOfPagesToShow: number

    @Field(() => GraphQLUpload, )
    document: FileUpload;
}