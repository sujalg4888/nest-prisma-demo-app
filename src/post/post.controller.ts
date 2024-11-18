/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponseHandler } from 'src/utils/api-response-handler';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('feed')
  async getPublishedPosts(): Promise<any> {
    try {
      const posts = await this.postService.posts({
        where: { published: true },
      });
      return ApiResponseHandler.successResponse(posts, 'Published posts retrieved successfully', 200);
    } catch (error) {
      return ApiResponseHandler.errorResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<any> {
    try {
      const uniquePost = await this.postService.fetchUniquePost({ id: Number(id) });
      return ApiResponseHandler.successResponse(uniquePost, 'Post Found', 200);
    } catch (error) {
      return ApiResponseHandler.errorResponse(error);
    }
  }

  @Get('filtered-posts/:searchString')
  async getFilteredPosts(@Param('searchString') searchString: string): Promise<any> {
    try {
      const posts = await this.postService.posts({
        where: {
          OR: [
            { title: { contains: searchString } },
            { content: { contains: searchString } },
          ],
        },
      });
      return ApiResponseHandler.successResponse(posts, 'Filtered posts retrieved successfully', 200);
    } catch (error) {
      return ApiResponseHandler.errorResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async createDraftPost(
    @Body() postData: { title: string; content?: string; authorEmail: string },
  ): Promise<any> {
    try {
      const { title, content, authorEmail } = postData;
      const createdPost = await this.postService.createPost({
        title,
        content,
        author: { connect: { email: authorEmail } },
      });
      return ApiResponseHandler.successResponse(createdPost, 'Draft post created successfully', 201);
    } catch (error) {
      return ApiResponseHandler.errorResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('publish/:id')
  async publishPost(@Param('id') id: string): Promise<any> {
    try {
      const updatedPost = await this.postService.updatePost({
        where: { id: Number(id) },
        data: { published: true },
      });
      return ApiResponseHandler.successResponse(updatedPost, 'Post published successfully', 200);
    } catch (error) {
      return ApiResponseHandler.errorResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deletePost(@Param('id') id: string): Promise<any> {
    try {
      const deletedPost = await this.postService.deletePost({ id: Number(id) });
      return ApiResponseHandler.successResponse(deletedPost, 'Post deleted successfully', 200);
    } catch (error) {
      return ApiResponseHandler.errorResponse(error);
    }
  }
}
