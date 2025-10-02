public with sharing class PostController {

    @AuraEnabled(cacheable=true)
    public static List<Post__c> getPosts() {
        // Basic object/field access checks (good practice)
        if (!Schema.sObjectType.Post__c.isAccessible()) {
            throw new AuraHandledException('You do not have access to Post__c.');
        }
        return [
            SELECT Id, Title__c, Content__c, CreatedDate, LastModifiedDate
            FROM Post__c
            ORDER BY CreatedDate DESC
            LIMIT 200
        ];
    }

    @AuraEnabled
    public static Id createPost(String title, String content) {
        try {       
            if (!Schema.sObjectType.Post__c.isCreateable()) {
                throw new AuraHandledException('You do not have create permission on Post__c.');
            }
            Post__c rec = new Post__c(
                Title__c   = title,
                Content__c = content
            );
            insert rec;
            return rec.Id;
        } catch (Exception e) {
            System.debug(' Error =>> ' + e.getStackTraceString() + 'Message =>> ' + e.getMessage());
        }
        return null;
    }

    @AuraEnabled
    public static Post__c updatePost(Post__c post) {
        if (!Schema.sObjectType.Post__c.isUpdateable()) {
            throw new AuraHandledException('You do not have update permission on Post__c.');
        }
        // Only Id + updatable fields need to be set on "post"
        update post;
        // Return fresh copy
        return [
            SELECT Id, Title__c, Content__c, CreatedDate, LastModifiedDate
            FROM Post__c
            WHERE Id = :post.Id
        ];
    }

    @AuraEnabled
    public static Id deletePost(Id postId) {
        if (!Schema.sObjectType.Post__c.isDeletable()) {
            throw new AuraHandledException('You do not have delete permission on Post__c.');
        }
        delete [SELECT Id FROM Post__c WHERE Id = :postId];
        return postId;
    }
}