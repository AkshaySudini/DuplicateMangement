public with sharing class FalsePositiveRecordsController {
    @AuraEnabled(cacheable=true)
    public static List<FalsePositiveRecordGroup> getPotentialFalsePositives() {
        List<FalsePositiveRecordGroup> falsePositives = new List<FalsePositiveRecordGroup>();

        // Fetch staging records
        List<Staging__c> stagingRecords = [
            SELECT Id, FirstName__c, LastName__c, Email__c, Phone__c, Birthdate__c, stagingStatus__c
            FROM Staging__c
            WHERE FirstName__c != NULL AND LastName__c != NULL
            ORDER BY FirstName__c, LastName__c
        ];
        System.debug('Fetched Staging Records: ' + stagingRecords); // Debug log for fetched staging records

        // Fetch contacts
        List<Contact> contacts = [
            SELECT Id, FirstName, LastName, Email, Phone, Birthdate
            FROM Contact
        ];
        System.debug('Fetched Contact Records: ' + contacts); // Debug log for fetched contact records

        // Compare staging records with contacts to find false positives
        for (Staging__c staging : stagingRecords) {
            List<Contact> matchingContacts = new List<Contact>();
            System.debug('Processing Staging Record: ' + staging); // Debug log for current staging record

            for (Contact contact : contacts) {
                System.debug('Comparing with Contact Record: ' + contact); // Debug log for current contact record
                // Check for same name but different email, phone, or birthdate
                if (staging.FirstName__c == contact.FirstName && 
                    staging.LastName__c == contact.LastName && 
                    (staging.Email__c != contact.Email || staging.Phone__c != contact.Phone || staging.Birthdate__c != contact.Birthdate)) {
                    matchingContacts.add(contact);
                    System.debug('Found Potential False Positive: ' + contact); // Debug log for potential false positive match
                }
            }
            
            if (!matchingContacts.isEmpty()) {
                System.debug('Found Matching Contacts for Staging Record ' + staging.Id + ': ' + matchingContacts); // Debug log for all matching contacts for a staging record
                FalsePositiveRecordGroup falsePositiveGroup = new FalsePositiveRecordGroup();
                falsePositiveGroup.key = staging.Id;
                falsePositiveGroup.stagingRecord = staging;
                falsePositiveGroup.contactRecords = matchingContacts;
                falsePositives.add(falsePositiveGroup);
            }
        }
        
        System.debug('False Positive Groups: ' + falsePositives); // Debug log for the final list of false positives
        return falsePositives;
    }
    
    // Helper class for grouping false positive records
    public class FalsePositiveRecordGroup {
        @AuraEnabled public String key;
        @AuraEnabled public Staging__c stagingRecord;
        @AuraEnabled public List<Contact> contactRecords;
    }
}