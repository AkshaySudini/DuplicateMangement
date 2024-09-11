import { LightningElement, track, wire } from 'lwc';
import getStagingRecords from '@salesforce/apex/StagingController.getStagingRecords';

export default class StagingRecordViewer extends LightningElement {
    @track stagingRecords; // To hold the fetched staging records

    // Define columns for the datatable with editable picklist field
    columns = [
        { label: 'First Name', fieldName: 'FirstName__c', type: 'text', editable: true },
        { label: 'Last Name', fieldName: 'LastName__c', type: 'text', editable: true },
        { label: 'Email', fieldName: 'Email__c', type: 'email', editable: true },
        { label: 'Phone', fieldName: 'Phone__c', type: 'phone', editable: true },
        { label: 'Birthdate', fieldName: 'Birthdate__c', type: 'date', editable: true },
        { 
            label: 'Status', 
            fieldName: 'stagingStatus__c', 
            type: 'picklist', // Set the type to 'picklist'
            typeAttributes: {
                placeholder: 'Choose status', 
                options: [
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Approved', value: 'Approved' },
                    { label: 'Rejected', value: 'Rejected' },
                    { label: 'Processed', value: 'Processed' }
                ], // Define picklist options
                editable: true, 
                context: { fieldName: 'Id' } // Context for inline editing
            }
        }
    ];

    // Wire Apex method to property to fetch data
    @wire(getStagingRecords)
    wiredStagingRecords({ error, data }) {
        if (data) {
            this.stagingRecords = data; // Assign fetched data to the stagingRecords property
        } else if (error) {
            console.error('Error fetching staging records:', error); // Log the error if there's an issue
        }
    }

    // Handle save event for inline editing
    handleSave(event) {
        // Implement logic to save edited records
    }
}
