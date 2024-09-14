public with sharing class StagingContactExactMatchController {

    @AuraEnabled(cacheable=true)
    public static List<MatchedGroupWrapper> getExactMatchesBetweenStagingAndContact() {
        List<MatchedGroupWrapper> matchedGroups = new List<MatchedGroupWrapper>();

        // SOQL query to fetch staging records
        List<Staging__c> stagingRecords = [
            SELECT Id, FirstName__c, LastName__c, Email__c, Phone__c 
            FROM Staging__c 
            WHERE Email__c != NULL AND Phone__c != NULL
            ORDER BY FirstName__c, LastName__c, Email__c, Phone__c
        ];

        // Create Sets to store unique emails and phones for querying contacts
        Set<String> emailSet = new Set<String>();
        Set<String> phoneSet = new Set<String>();

        // Populate the Sets with Email and Phone values from Staging records
        for (Staging__c staging : stagingRecords) {
            if (staging.Email__c != null) {
                emailSet.add(staging.Email__c);
            }
            if (staging.Phone__c != null) {
                phoneSet.add(staging.Phone__c);
            }
        }

        // SOQL query to fetch matching contacts based on staging records
        List<Contact> contactRecords = [
            SELECT Id, FirstName, LastName, Email, Phone 
            FROM Contact 
            WHERE Email IN :emailSet OR Phone IN :phoneSet
        ];

        // Grouping logic
        for (Staging__c staging : stagingRecords) {
            List<Contact> matchingContacts = new List<Contact>();

            for (Contact contact : contactRecords) {
                if ((staging.Email__c != null && staging.Email__c == contact.Email) ||
                    (staging.Phone__c != null && staging.Phone__c == contact.Phone)) {
                    matchingContacts.add(contact);
                }
            }

            if (!matchingContacts.isEmpty()) {
                matchedGroups.add(new MatchedGroupWrapper(staging, matchingContacts));
            }
        }

        return matchedGroups;
    }

    // Wrapper class to store matched records
    public class MatchedGroupWrapper {
        @AuraEnabled public Staging__c stagingRecord;
        @AuraEnabled public List<Contact> contactRecords;

        public MatchedGroupWrapper(Staging__c staging, List<Contact> contacts) {
            this.stagingRecord = staging;
            this.contactRecords = contacts;
        }
    }
}
