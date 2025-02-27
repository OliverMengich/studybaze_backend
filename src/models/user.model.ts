/* eslint-disable prettier/prettier */
import { Field, ObjectType, } from '@nestjs/graphql';
// import { Document } from './document.model';

@ObjectType()
export class User {

    @Field()
    id: string;
    
    @Field()
    name: string;
    
    @Field()
    email: string;
    
    @Field()
    password: string;
    
    @Field({nullable: true})
    profile_image: string;
    
    // @Field({defaultValue:[]})
    // bought_documents: Document[]
}
