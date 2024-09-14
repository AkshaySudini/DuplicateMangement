import { LightningElement, track, wire } from 'lwc';
import getExactMatchesBetweenStagingAndContact from '@salesforce/apex/StagingContactExactMatchController.getExactMatchesBetweenStagingAndContact';


export default class ExactMatchContacts extends LightningElement {
    @track matchedGroups = [];

    // Define columns for the staging datatable
    stagingColumns = [
        { label: 'First Name', fieldName: 'FirstName__c', type: 'text', sortable: true },
        { label: 'Last Name', fieldName: 'LastName__c', type: 'text', sortable: true },
        { label: 'Email', fieldName: 'Email__c', type: 'email', sortable: true },
        { label: 'Phone', fieldName: 'Phone__c', type: 'phone', sortable: true }
    ];

    // Wire method to fetch exact matches between staging and contacts
    @wire(getExactMatchesBetweenStagingAndContact)
    wiredExactMatches({ error, data }) {
        if (data) {
            this.matchedGroups = data.map(match => match.stagingRecord); // Extract only staging records to display
        } else if (error) {
            console.error('Error fetching exact match records:', error); // Log errors if any
        }
    }
}
