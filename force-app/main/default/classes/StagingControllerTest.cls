@IsTest
public class StagingControllerTest {

    @IsTest
    static void testGetStagingRecords() {
        // Step 1: Create test data for Staging__c records
        List<Staging__c> stagingRecords = new List<Staging__c>();
        
        stagingRecords.add(new Staging__c(
            FirstName__c = 'John',
            LastName__c = 'Doe',
            Email__c = 'john.doe@example.com',
            Secondary_Email__c = 'john.doe.secondary@example.com',
            Other_Email__c = 'john.doe.other@example.com',
            umail__c = 'u1000001@utah.edu',
            Phone__c = '1234567890',
            Birthdate__c = Date.newInstance(1990, 1, 1),
            stagingStatus__c = 'Pending'
        ));

        stagingRecords.add(new Staging__c(
            FirstName__c = 'Jane',
            LastName__c = 'Smith',
            Email__c = 'jane.smith@example.com',
            Secondary_Email__c = 'jane.smith.secondary@example.com',
            Other_Email__c = 'jane.smith.other@example.com',
            umail__c = 'u1000002@utah.edu',
            Phone__c = '0987654321',
            Birthdate__c = Date.newInstance(1985, 5, 5),
            stagingStatus__c = 'Approved'
        ));
        
        // Insert staging records
        insert stagingRecords;
        
        // Step 2: Call the method to be tested
        Test.startTest();
        List<Staging__c> fetchedRecords = StagingController.getStagingRecords();
        Test.stopTest();
        
        // Step 3: Verify the results
        System.assertNotEquals(0, fetchedRecords.size(), 'There should be staging records fetched.');
        
        // Verify the number of records fetched matches the number of records inserted
        System.assertEquals(stagingRecords.size(), fetchedRecords.size(), 'The number of fetched records should match the number of inserted records.');
        
        // Verify the fetched records contain the inserted data
        Staging__c fetchedRecord1 = fetchedRecords[0];
        System.assertEquals('John', fetchedRecord1.FirstName__c, 'First record FirstName should match.');
        System.assertEquals('Doe', fetchedRecord1.LastName__c, 'First record LastName should match.');
        System.assertEquals('john.doe@example.com', fetchedRecord1.Email__c, 'First record Email should match.');
        System.assertEquals('Pending', fetchedRecord1.stagingStatus__c, 'First record stagingStatus should match.');
        
        Staging__c fetchedRecord2 = fetchedRecords[1];
        System.assertEquals('Jane', fetchedRecord2.FirstName__c, 'Second record FirstName should match.');
        System.assertEquals('Smith', fetchedRecord2.LastName__c, 'Second record LastName should match.');
        System.assertEquals('jane.smith@example.com', fetchedRecord2.Email__c, 'Second record Email should match.');
        System.assertEquals('Approved', fetchedRecord2.stagingStatus__c, 'Second record stagingStatus should match.');
    }
}
