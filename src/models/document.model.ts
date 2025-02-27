/* eslint-disable prettier/prettier */
import { Field, ObjectType, } from '@nestjs/graphql';
// import { User } from './user.model';

@ObjectType()
export class Document {

    @Field()
    id: string;
    
    @Field()
    title: string;

    @Field()
    document_path: string;

    @Field()
    preview_path: string;
    
    @Field()
    price: number

    @Field()
    thumbnail_image: string

    @Field()
    pages: number

    @Field()
    rating: number

    @Field()
    createdAt: Date

    @Field()
    updatedAt: Date

    // @Field()
    // users: User[]

    @Field()
    category: string

    @Field()
    downloadsCount: number
}
