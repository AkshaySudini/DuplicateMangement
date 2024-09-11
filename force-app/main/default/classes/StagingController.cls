public with sharing class StagingController {

    // Method to fetch staging records
    @AuraEnabled(cacheable=true)
    public static List<Staging__c> getStagingRecords() {
        // Query to fetch Staging records
        return [SELECT Id, FirstName__c, LastName__c, Email__c, Secondary_Email__c, Other_Email__c, umail__c, Phone__c, Birthdate__c, stagingStatus__c 
                FROM Staging__c
                ORDER BY CreatedDate DESC];
    }
}
