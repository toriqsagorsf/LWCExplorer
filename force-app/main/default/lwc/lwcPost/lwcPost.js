import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getPosts from '@salesforce/apex/PostController.getPosts';
import createPost from '@salesforce/apex/PostController.createPost';
import updatePost from '@salesforce/apex/PostController.updatePost';
import deletePost from '@salesforce/apex/PostController.deletePost';

export default class LwcPost extends LightningElement {
  @track form = { id: null, title: '', content: '' };
  isEditing = false;

  columns = [
    { label: 'Title', fieldName: 'Title__c' },
    { label: 'Content', fieldName: 'Content__c' },
    { label: 'Created', fieldName: 'CreatedDate', type: 'date' },
    {
      type: 'action',
      typeAttributes: {
        rowActions: [
          { label: 'Edit', name: 'edit' },
          { label: 'Delete', name: 'delete' }
        ]
      }
    }
  ];

  rows = [];
  wiredResult; // to refresh after mutations

  @wire(getPosts)
  wiredPosts(result) {
    this.wiredResult = result;
    const { data, error } = result;
    if (data) {
      this.rows = data;
    } else if (error) {
      this.toast('Error loading posts', this.pickError(error), 'error');
    }
  }

  // ========== Form handlers ==========
  handleInput(e) {
    const field = e.target.dataset.field;
    const value = e.target.value;
    this.form = { ...this.form, [field]: value };
  }

  resetForm() {
    this.form = { id: null, title: '', content: '' };
    this.isEditing = false;
  }

  // ========== Create ==========
  async handleCreate() {
    if (!this.form.title?.trim()) {
      this.toast('Validation', 'Title is required', 'warning');
      return;
    }
    try {
      await createPost({ title: this.form.title, content: this.form.content || '' });
      this.toast('Created', 'Post created successfully', 'success');
      this.resetForm();
      await refreshApex(this.wiredResult);
    } catch (e) {
      this.toast('Create failed', this.pickError(e), 'error');
    }
  }

  // ========== Save (Update) ==========
  async handleSave() {
    if (!this.form.id) return;
    if (!this.form.title?.trim()) {
      this.toast('Validation', 'Title is required', 'warning');
      return;
    }
    const record = {
      Id: this.form.id,
      Title__c: this.form.title,
      Content__c: this.form.content || ''
    };
    try {
      await updatePost({ post: record });
      this.toast('Saved', 'Post updated', 'success');
      this.resetForm();
      await refreshApex(this.wiredResult);
    } catch (e) {
      this.toast('Save failed', this.pickError(e), 'error');
    }
  }

  handleCancel() {
    this.resetForm();
  }

  // ========== Row actions ==========
  handleRowAction(event) {
    const action = event.detail.action.name;
    const row = event.detail.row;

    if (action === 'edit') {
      this.isEditing = true;
      this.form = {
        id: row.Id,
        title: row.Title__c,
        content: row.Content__c
      };
      // scroll to form if needed
      return;
    }

    if (action === 'delete') {
      this.confirmDelete(row.Id);
    }
  }

  async confirmDelete(id) {
    // Simple confirm; replace with lightning/confirm if preferred
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this post?');
    if (!ok) return;

    try {
      await deletePost({ postId: id });
      this.toast('Deleted', 'Post deleted', 'success');
      await refreshApex(this.wiredResult);
    } catch (e) {
      this.toast('Delete failed', this.pickError(e), 'error');
    }
  }

  // ========== Utils ==========
  toast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }

  pickError(e) {
    return e?.body?.message || e?.message || 'Unknown error';
  }
}
