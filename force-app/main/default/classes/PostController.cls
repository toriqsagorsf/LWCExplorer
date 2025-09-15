public with sharing class PostController {
    
    // Retrieve posts
    @AuraEnabled(cacheable=true)
    public static List<Post__c> getPosts() {
        return [SELECT Id, Title__c, Content__c, CreatedDate 
                FROM Post__c 
                ORDER BY CreatedDate DESC 
                LIMIT 50];
    }
    
    // Create a new post
    @AuraEnabled
    public static Post__c createPost(String title, String content) {
        Post__c newPost = new Post__c(
            Title__c = title,
            Content__c = content
        );
        insert newPost;
        return newPost;
    }
    
    // Update existing post
    @AuraEnabled
    public static Post__c updatePost(Id postId, String title, String content) {
        Post__c updatePost = [SELECT Id, Title__c, Content__c 
                            FROM Post__c 
                            WHERE Id = :postId 
                            LIMIT 1];
        updatePost.Title__c = title;
        updatePost.Content__c = content;
        update updatePost;
        return updatePost;
    }
}
