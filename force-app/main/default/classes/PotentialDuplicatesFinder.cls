public with sharing class PotentialDuplicatesFinder {

    @AuraEnabled(cacheable=true)
    public static List<PotentialDuplicateGroup> findPotentialDuplicates() {
        List<PotentialDuplicateGroup> indirectMatches = new List<PotentialDuplicateGroup>();

        // Fetch JSON records from the staging object
        List<Staging__c> stagingRecords = [SELECT Id, FirstName__c, LastName__c, Email__c, Secondary_Email__c, Other_Email__c, umail__c, Phone__c, MobilePhone__c, OtherPhone__c FROM Staging__c];
        System.debug('Fetched Staging Records: ' + stagingRecords); // Debug log for fetched staging records

        // Fetch existing Contacts to compare with
        List<Contact> contacts = [SELECT Id, FirstName, LastName, Email, Secondary_Email__c, Other_Email__c, Phone, MobilePhone, OtherPhone FROM Contact];
        System.debug('Fetched Contact Records: ' + contacts); // Debug log for fetched contact records

        // Compare staging records with contacts to find potential indirect matches
        for (Staging__c staging : stagingRecords) {
            List<Contact> matchingContacts = new List<Contact>();

            // Create sets for staging emails and phones
            Set<String> stagingEmails = new Set<String>{staging.Email__c, staging.Secondary_Email__c, staging.Other_Email__c, staging.umail__c};
            Set<String> stagingPhones = new Set<String>{staging.Phone__c, staging.MobilePhone__c, staging.OtherPhone__c};
            
            // Remove null values to prevent null pointer exceptions
            stagingEmails.remove(null);
            stagingPhones.remove(null);
            
            System.debug('Processing Staging Record: ' + staging); // Debug log for current staging record
            System.debug('Staging Emails: ' + stagingEmails); // Debug log for staging emails
            System.debug('Staging Phones: ' + stagingPhones); // Debug log for staging phones

            for (Contact contact : contacts) {
                // Create sets for contact emails and phones
                Set<String> contactEmails = new Set<String>{contact.Email, contact.Secondary_Email__c, contact.Other_Email__c};
                Set<String> contactPhones = new Set<String>{contact.Phone, contact.MobilePhone, contact.OtherPhone};

                // Remove null values to prevent null pointer exceptions
                contactEmails.remove(null);
                contactPhones.remove(null);

                System.debug('Comparing with Contact Record: ' + contact); // Debug log for current contact record
                System.debug('Contact Emails: ' + contactEmails); // Debug log for contact emails
                System.debug('Contact Phones: ' + contactPhones); // Debug log for contact phones

                // Scenario 1: Same Last Name, Matching Phone, Different First Name and Email
                if (staging.LastName__c == contact.LastName &&
                    !stagingPhones.isEmpty() && !contactPhones.isEmpty() && // Check if sets are not empty
                    !stagingEmails.isEmpty() && !contactEmails.isEmpty() && // Check if sets are not empty
                    !getIntersection(stagingPhones, contactPhones).isEmpty() && // Check for matching phones
                    getIntersection(stagingEmails, contactEmails).isEmpty() && // Check for different emails
                    staging.FirstName__c != contact.FirstName) {
                    matchingContacts.add(contact);
                    System.debug('Found Potential Indirect Match (Scenario 1): ' + contact); // Debug log for potential indirect match (Scenario 1)
                }
                
                // Scenario 2: Same Last Name, Matching Email, Different First Name and Phone
                else if (staging.LastName__c == contact.LastName &&
                         !getIntersection(stagingEmails, contactEmails).isEmpty() && // Check for matching emails
                         getIntersection(stagingPhones, contactPhones).isEmpty() && // Check for different phones
                         staging.FirstName__c != contact.FirstName) {
                    matchingContacts.add(contact);
                    System.debug('Found Potential Indirect Match (Scenario 2): ' + contact); // Debug log for potential indirect match (Scenario 2)
                }
            }

            // Add to result if there are matches
            if (!matchingContacts.isEmpty()) {
                System.debug('Found Matching Contacts for Staging Record ' + staging.Id + ': ' + matchingContacts); // Debug log for all matching contacts for a staging record
                PotentialDuplicateGroup potentialDuplicateGroup = new PotentialDuplicateGroup();
                potentialDuplicateGroup.stagingRecord = staging;
                potentialDuplicateGroup.contactRecords = matchingContacts;
                indirectMatches.add(potentialDuplicateGroup);
            }
        }
        System.debug('Final List of Indirect Matches: ' + indirectMatches); // Debug log for the final list of indirect matches
        return indirectMatches;
    }

    // Helper method to get intersection between two sets
    private static Set<String> getIntersection(Set<String> set1, Set<String> set2) {
        Set<String> intersection = new Set<String>();
        for (String item : set1) {
            if (set2.contains(item)) {
                intersection.add(item);
            }
        }
        return intersection;
    }

    // Helper class for grouping potential indirect matches
    public class PotentialDuplicateGroup {
        @AuraEnabled public Staging__c stagingRecord;
        @AuraEnabled public List<Contact> contactRecords;
    }
}
