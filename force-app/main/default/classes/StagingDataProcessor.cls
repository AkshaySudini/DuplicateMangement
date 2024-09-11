public with sharing class StagingDataProcessor {

    public static void retrieveAndProcessJsonData() {
        try {
            // Load JSON data from the static resource
            String jsonData = loadStaticResource('ContactStagingData');
            
            // Parse JSON data into a map
            Map<String, Object> jsonMap = (Map<String, Object>) JSON.deserializeUntyped(jsonData);
            
            // Extract the list of contacts from the 'data' key
            List<Object> contactList = (List<Object>) jsonMap.get('data');

            // List to store staging records to be inserted
            List<Staging__c> stagingRecords = new List<Staging__c>();

            // Loop through the parsed JSON data and create staging records
            for (Object contactObj : contactList) {
                Map<String, Object> contactData = (Map<String, Object>) contactObj;
                Staging__c stagingRecord = new Staging__c();
                stagingRecord.FirstName__c = (String) contactData.get('FirstName');
                stagingRecord.LastName__c = (String) contactData.get('LastName');
                stagingRecord.Email__c = (String) contactData.get('Email');
                stagingRecord.Secondary_Email__c = (String) contactData.get('Secondary_Email__c');
                stagingRecord.Other_Email__c = (String) contactData.get('Other_Email__c');
                stagingRecord.umail__c = (String) contactData.get('umail__c');
                stagingRecord.Phone__c = (String) contactData.get('Phone');
                stagingRecord.MobilePhone__c = (String) contactData.get('MobilePhone');
                stagingRecord.OtherPhone__c = (String) contactData.get('OtherPhone');
                
                String birthdateStr = (String) contactData.get('Birthdate');
                if (birthdateStr != null) {
                    stagingRecord.Birthdate__c = Date.valueOf(birthdateStr);
                }

                stagingRecord.stagingStatus__c = 'Pending';  // Default status

                // Add the staging record to the list
                stagingRecords.add(stagingRecord);
            }

            // Insert staging records into the Staging__c object
            if (!stagingRecords.isEmpty()) {
                insert stagingRecords;
                System.debug('Staging records have been inserted successfully.');
            }
        } catch (Exception e) {
            // Handle exception and log the error
            System.debug('Error processing JSON data: ' + e.getMessage());
            throw new AuraHandledException('Error processing JSON data: ' + e.getMessage());
        }
    }

    // Helper method to load static resource content
    private static String loadStaticResource(String resourceName) {
        StaticResource resource = [SELECT Body FROM StaticResource WHERE Name = :resourceName];
        return resource.Body.toString();  // Convert the Blob to String
    }
}