public with sharing class ContactHandler {

    /**
     * Method to create contacts from a list of staging records and update their status to "Processed"
     * @param records List of staging records containing contact information
     * @return List of Contact records created
     */
    @AuraEnabled
    public static List<Contact> createContactsFromRecords(List<Staging__c> records) {
        if (records == null || records.isEmpty()) {
            throw new AuraHandledException('No records provided for contact creation.');
        }

        List<Contact> contactsToCreate = new List<Contact>();
        List<Staging__c> recordsToUpdate = new List<Staging__c>();

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
            );
            contactsToCreate.add(newContact);

            // Update the status of the staging record to "Processed"
            stagingRecord.stagingStatus__c = 'Processed'; // Assuming "Status__c" is the status field
            recordsToUpdate.add(stagingRecord);
        }

        // Insert new contactsgit 
        if (!contactsToCreate.isEmpty()) {
            try {
                insert contactsToCreate;
            } catch (Exception e) {
                throw new AuraHandledException('Error occurred while creating contacts: ' + e.getMessage());
            }
        }

        // Update staging records to "Processed"
        if (!recordsToUpdate.isEmpty()) {
            try {
                update recordsToUpdate;
            } catch (Exception e) {
                throw new AuraHandledException('Error occurred while updating staging records: ' + e.getMessage());
            }
        }

        return contactsToCreate;
    }


    @AuraEnabled
    public static void deleteRecords(List<Id> recordIds) {
        try {
            delete [SELECT Id FROM Staging__c WHERE Id IN :recordIds];
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting records: ' + e.getMessage());
        }
    }


    @AuraEnabled
    public static void updateStagingRecords(List<Id> recordIds, String newStatus) {
        // Query the records to be updated
        List<Staging__c> recordsToUpdate = [SELECT Id, stagingStatus__c FROM Staging__c WHERE Id IN :recordIds];

        // Update the status for each record
        for (Staging__c record : recordsToUpdate) {
            record.stagingStatus__c = newStatus; // Set the new status
        }

        // Perform the update
        try {
            update recordsToUpdate;
            System.debug('Successfully updated records to status: ' + newStatus);
        } catch (DmlException e) {
            System.debug('Error updating records: ' + e.getMessage());
            throw new AuraHandledException('Failed to update records: ' + e.getMessage());
        }
    }






}
