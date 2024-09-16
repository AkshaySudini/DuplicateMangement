public with sharing class ContactHandler {

    /**
     * Method to create contacts from a list of staging records
     * @param records List of staging records containing contact information
     * @return List of Contact records created
     */
    @AuraEnabled
    public static List<Contact> createContactsFromRecords(List<Staging__c> records) {
        if (records == null || records.isEmpty()) {
            throw new AuraHandledException('No records provided for contact creation.');
        }

        List<Contact> contactsToCreate = new List<Contact>();

        for (Staging__c stagingRecord : records) {
            // Create a new Contact record based on the staging record fields
            Contact newContact = new Contact(
                FirstName = stagingRecord.FirstName__c,
                LastName = stagingRecord.LastName__c,
                Email = stagingRecord.Email__c,
                Other_Email__c = stagingRecord.Other_Email__c, // Custom field mapping
                Secondary_Email__c = stagingRecord.Secondary_Email__c, // Custom field mapping
                Umail__c = stagingRecord.umail__c, // Custom field mapping
                Phone = stagingRecord.Phone__c,
                MobilePhone = stagingRecord.MobilePhone__c,
                OtherPhone = stagingRecord.OtherPhone__c,
                Birthdate = stagingRecord.Birthdate__c
                // Add other mappings as needed
            );
            contactsToCreate.add(newContact);
        }

        if (!contactsToCreate.isEmpty()) {
            try {
                insert contactsToCreate;
            } catch (Exception e) {
                throw new AuraHandledException('Error occurred while creating contacts: ' + e.getMessage());
            }
        }

        return contactsToCreate;
    }
}
