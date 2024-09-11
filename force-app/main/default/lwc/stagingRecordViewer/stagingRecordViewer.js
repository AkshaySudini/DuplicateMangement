import { LightningElement, track, wire } from 'lwc';
import getStagingRecords from '@salesforce/apex/StagingController.getStagingRecords';

export default class StagingRecordViewer extends LightningElement {
    @track stagingRecords; // To hold the fetched staging records

    // Define columns for the datatable
    columns = [
        { label: 'First Name', fieldName: 'FirstName__c', type: 'text' },
        { label: 'Last Name', fieldName: 'LastName__c', type: 'text' },
        { label: 'Email', fieldName: 'Email__c', type: 'email' },
        { label: 'Secondary Email', fieldName: 'Secondary_Email__c', type: 'email' },
        { label: 'Other Email', fieldName: 'Other_Email__c', type: 'email' },
        { label: 'Umail', fieldName: 'umail__c', type: 'email' },
        { label: 'Phone', fieldName: 'Phone__c', type: 'phone' },
        { label: 'Birthdate', fieldName: 'Birthdate__c', type: 'date' },
        { label: 'Status', fieldName: 'stagingStatus__c', type: 'text' }
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
}
