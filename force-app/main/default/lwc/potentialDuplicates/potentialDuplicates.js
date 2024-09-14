import { LightningElement, track, wire } from 'lwc';
import findPotentialDuplicates from '@salesforce/apex/PotentialDuplicatesFinder.findPotentialDuplicates';

export default class PotentialDuplicatesLWC extends LightningElement {
    @track potentialDuplicateGroups = [];

    // Define columns for the staging datatable
    stagingColumns = [
        { label: 'First Name', fieldName: 'FirstName__c', type: 'text' },
        { label: 'Last Name', fieldName: 'LastName__c', type: 'text' },
        { label: 'Email', fieldName: 'Email__c', type: 'email' },
        { label: 'Phone', fieldName: 'Phone__c', type: 'phone' }
    ];

    // Define columns for the contact datatable
    contactColumns = [
        { label: 'First Name', fieldName: 'FirstName', type: 'text' },
        { label: 'Last Name', fieldName: 'LastName', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' }
    ];

    // Wire method to fetch potential duplicates from Apex
    @wire(findPotentialDuplicates)
    wiredPotentialDuplicates({ error, data }) {
        if (data) {
            this.potentialDuplicateGroups = data.map((group, index) => ({
                key: `Group_${index}`,
                stagingRecord: [group.stagingRecord], // Display as an array to match data-table format
                contactRecords: group.contactRecords
            }));
        } else if (error) {
            console.error('Error fetching potential duplicate records:', error);
        }
    }
}
