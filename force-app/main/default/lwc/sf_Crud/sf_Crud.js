import { LightningElement, track, wire } from 'lwc';
import getposts from '@salesforce/apex/PostController.getposts';
// import createpost from '@salesforce/apex/PostController.createpost';
// import updatepost from '@salesforce/apex/PostController.updatepost';
// import deletepost from '@salesforce/apex/PostController.deletepost';

export default class Sf_Crud extends LightningElement {

    @track posts = [];
    @track title = '';
    @track content = '';
    @track selectedPostId = null;

    @wire(getposts)
        wiredPosts({error, data}){
            if(data){
                this.posts = data;
            }else if(error){
                console.log(error);
        }
    }

    handleTitleChange(event){
        this.post = event.target.value;
    }
    handleContentChange(event){
        this.content= event.target.value;
    }

    async handleCreate(){
        try{
            const newPost = await createPost({ title: this.title, content: this.content });
            this.posts = [newPost, ...this.posts]; // add at top
            this.title = '';
            this.content = '';
        } catch (error) {
            console.error('Error creating post', error);
        }
    }

     // Select post to edit
    handleEdit(event) {
        const postId = event.target.dataset.id;
        const post = this.posts.find(p => p.Id === postId);
        this.selectedPostId = postId;
        this.title = post.Title__c;
        this.content = post.Content__c;
    }

    // Update post
    async handleUpdate() {
        try {
            const updated = await updatePost({ postId: this.selectedPostId, title: this.title, content: this.content });
            this.posts = this.posts.map(p => (p.Id === updated.Id ? updated : p));
            this.title = '';
            this.content = '';
            this.selectedPostId = null;
        } catch (error) {
            console.error('Error updating post', error);
        }
    }

}