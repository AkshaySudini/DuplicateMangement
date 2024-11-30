public with sharing class StagingContactExactMatchController {

    @AuraEnabled(cacheable=true)
    public static List<ExactMatchGroup> getExactMatchesBetweenStagingAndContact() {
        List<ExactMatchGroup> exactMatches = new List<ExactMatchGroup>();

        // Fetch records from the staging object including the stagingStatus__c field
        List<Staging__c> stagingRecords = [
            SELECT Id, FirstName__c, LastName__c, Email__c, Phone__c, stagingStatus__c
            FROM Staging__c
        ];
        System.debug('Fetched Staging Records: ' + stagingRecords); // Debug log for fetched staging records

        // Fetch existing Contacts to compare with
        List<Contact> contacts = [
            SELECT Id, FirstName, LastName, Email, Phone
            FROM Contact
        ];
        System.debug('Fetched Contact Records: ' + contacts); // Debug log for fetched contact records

        // Compare staging records with contacts to find exact matches
        for (Staging__c staging : stagingRecords) {
            // Skip processed records
            if (staging.stagingStatus__c == 'Processed') {
                System.debug('Skipping processed staging record: ' + staging.Id);
                continue;
            }

            List<Contact> matchingContacts = new List<Contact>();

            for (Contact contact : contacts) {
                // Check for exact match based on the criteria (FirstName, LastName, Email, Phone)
                if (staging.FirstName__c == contact.FirstName &&
                    staging.LastName__c == contact.LastName &&
                    staging.Email__c == contact.Email &&
                    staging.Phone__c == contact.Phone) {
                    matchingContacts.add(contact);
                    System.debug('Found Exact Match: ' + contact); // Debug log for exact match
                }
            }

            // Add to result if there are matches
            if (!matchingContacts.isEmpty()) {
                System.debug('Found Matching Contacts for Staging Record ' + staging.Id + ': ' + matchingContacts); // Debug log for all matching contacts for a staging record
                ExactMatchGroup matchGroup = new ExactMatchGroup();
                matchGroup.stagingRecord = staging;
                matchGroup.contactRecords = matchingContacts;
                exactMatches.add(matchGroup);
            }
        }
        System.debug('Final List of Exact Matches: ' + exactMatches); // Debug log for the final list of exact matches
        return exactMatches;
    }

    // Helper class for grouping exact matches
    public class ExactMatchGroup {
        @AuraEnabled public Staging__c stagingRecord;
        @AuraEnabled public List<Contact> contactRecords;
    }
}
