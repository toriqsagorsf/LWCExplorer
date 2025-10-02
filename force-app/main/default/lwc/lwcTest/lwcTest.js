import { LightningElement, track, wire } from 'lwc';
import {refreshAPex} from '@salesforce/apex';
import {showToastEvent} from 'lightning/platformShowToastEvent';

import getPosts from '@salesforce/apex/PostController.getPosts';
import updatePost from '@salesforce/apex/PostController.updatePost';
import deletePost from '@salesforce/apex/PostController.deletePost';
import createPost from '@salesforce/apex/PostController.createPost';


export default class LwcTest extends LightningElement {
    @track form = {Id: null, title: null, content: null}
    isEditing = false;

    columns = [
        { label: 'Title', fieldName: 'Title__c', type: 'text' },
        { label: 'Content', fieldName: 'Content__c', type: 'text' },
        { label: 'Created', fieldName: 'CreatedDate', type: 'date' },
        { type: 'action', 
          typeAttributes:[
            {label: 'Edit', name: 'edit'},
            {label: 'Delete', name: 'delete'}
            ]
        } 
    ];
    rows = []; // to refresh after mutations
    wireResult;

    @wire(getPosts)
    wiredPosts(result){
        const {data, error} = result;
        if (data) {
            this.rows = data;
        } else if(error){
            this.toast('Error loading posts', this.pickError(error), 'error');
        }
    }

    // ================= FORM handling =================
    handleInput(event){
        const field = event.target.dataset.field;
        const value = event.target.value;
        this.form = {...this.form, [field]: value};
    }

    // ============ Create ============

    async handleCreate(){
        if(!this.form.title?.trim()){
            this.toast('Error creating post', 'Title is required', 'error');
            return;
        }
        try{
            await createPost({title: this.form.title, content: this.form.content});
            this.toast('Success', 'Post created', 'success');
            this.resetForm();
            this.refreshAPex(this.wireResult);
        }
        catch(error){
            this.toast('Error creating post', this.pickError(error), 'error');
        }
    }

    // ====================UPdate record ===============
    async handleUpdate(){
        if(!this.form.id?.trim()){
            this.toast('Error updating post', 'Id is required', 'error');
            return;
        }
        const record = {
            Id: this.form.Id,
            Title__c: this.form.title,
            Content__c: this.form.content
        }
        try{
            await updatePost({psot: record});
            this.toast('Success', 'Post updated', 'success');
            this.resetForm();
            this.refreshAPex(this.wireResult);
        }
        catch(error){
            this.toast('Error updating post', this.pickError(error), 'error');
        }
    }

    handleCancel(){
        this.resetForm();
    }

    // ============ Delete record ============
    async handleDelete(){
        if(!this.form.id?.trim()){
            this.toast('Error deleting post', 'Id is required', 'error');
            return;
        }
        try{
            await deletePost({postId: this.form.id});
            this.toast('Success', 'Post deleted', 'success');
            this.resetForm();
        }
        catch(error){
            this.toast('Error deleting post', this.pickError(error), 'error');
        }
    }

    // Row actions
    handleRowAction(event){
        const action = event.detail.action.name;
        const row = event.detail.row;
        if(action == 'edit'){
            this.form = {
                id: row.id,
                title: row.Title__c,
                content: row.Content__c
            }
            this.isEditing = true;
            return;
        }
        else if(action == 'delete'){
            this.deletePost(row.id);          
        }
    }

    resetForm(){
        this.form = {Id: null, title: null, content: null};
        this.isEditing = false;
    }

    pickError(error){
        return error?.body?.message ? error?.message : 'Unknown error';
    }

}