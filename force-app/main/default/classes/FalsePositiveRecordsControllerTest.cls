@IsTest
public class FalsePositiveRecordsControllerTest {
    
    @IsTest
    static void testGetPotentialFalsePositives() {
        // Step 1: Create test data for Staging__c records
        List<Staging__c> stagingRecords = new List<Staging__c>();
        stagingRecords.add(new Staging__c(
            FirstName__c = 'John',
            LastName__c = 'Doe',
            Email__c = 'john.doe@example.com',
            Phone__c = '1234567890',
            Birthdate__c = Date.newInstance(1990, 1, 1)
        ));
        stagingRecords.add(new Staging__c(
            FirstName__c = 'Jane',
            LastName__c = 'Smith',
            Email__c = 'jane.smith@example.com',
            Phone__c = '0987654321',
            Birthdate__c = Date.newInstance(1985, 5, 5)
        ));
        insert stagingRecords;
        
        // Step 2: Create test data for Contact records
        List<Contact> contactRecords = new List<Contact>();
        contactRecords.add(new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'john.different@example.com', // Different email
            Phone = '1234567890', // Same phone
            Birthdate = Date.newInstance(1990, 1, 1) // Same birthdate
        ));
        contactRecords.add(new Contact(
            FirstName = 'Jane',
            LastName = 'Smith',
            Email = 'jane.smith@example.com', // Same email
            Phone = '1111111111', // Different phone
            Birthdate = Date.newInstance(1980, 3, 3) // Different birthdate
        ));
        insert contactRecords;
        
        // Step 3: Call the method to be tested
        Test.startTest();
        List<FalsePositiveRecordsController.FalsePositiveRecordGroup> results = FalsePositiveRecordsController.getPotentialFalsePositives();
        Test.stopTest();
        
        // Step 4: Verify the results
        System.assertNotEquals(0, results.size(), 'There should be false positive records identified.');

        // Verify the first false positive record
        FalsePositiveRecordsController.FalsePositiveRecordGroup firstGroup = results[0];
        System.assertEquals(stagingRecords[0].Id, firstGroup.stagingRecord.Id, 'The first false positive should be linked to the correct staging record.');
        System.assertEquals(1, firstGroup.contactRecords.size(), 'There should be one matching contact for the first staging record.');
        System.assertEquals(contactRecords[0].Id, firstGroup.contactRecords[0].Id, 'The matching contact for the first staging record should be correct.');

        // Verify the second false positive record
        FalsePositiveRecordsController.FalsePositiveRecordGroup secondGroup = results[1];
        System.assertEquals(stagingRecords[1].Id, secondGroup.stagingRecord.Id, 'The second false positive should be linked to the correct staging record.');
        System.assertEquals(1, secondGroup.contactRecords.size(), 'There should be one matching contact for the second staging record.');
        System.assertEquals(contactRecords[1].Id, secondGroup.contactRecords[0].Id, 'The matching contact for the second staging record should be correct.');
    }
}
