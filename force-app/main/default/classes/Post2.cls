public with sharing class Post2 {
    public Post2() {

    }

    @AuraEnabled (cacheable=true)
    public static List<Post__c> getPosts(){

        if(!Schema.SObjectType.Post__c.isAccessible()){
            throw new AuraHandledException('You don\'t have any acceess to Post__c ');
        }
        try {
            return [SELECT Id,Title__c, Content__c FROM Post__c Limit 200];

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Id createPost(Post__c post){
        if(!Schema.SObjectType.Post__c.isCreateable()){
            throw new AuraHandledException('You don\'t have any create permission on Post__c ');
        }
        try {
            Post__c record = new Post__c(
                Title__c = post.Title__c,
                Content__c = post.Content__c
            );
            insert post;
            return post.Id;
        }
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Post__c updatedPost(Post__c post){
        try {
            if (String.isBlank(post.id)) {
                return 'Id is missing for update operation';
            }
            udpate post;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string deletePost(String Id){
        try {
            delete [SELECT Id FROM Post__c WHERE Id = :Id];
            return 'Post deleted successfully';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


}