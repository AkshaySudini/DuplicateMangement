import { LightningElement, track, wire } from 'lwc';
import getPotentialFalsePositives from '@salesforce/apex/FalsePositiveRecordsController.getPotentialFalsePositives';

export default class FalsePositivesLWC extends LightningElement {
    @track falsePositiveGroups = [];

    // Define columns for the datatable
    columns = [
        { label: 'First Name', fieldName: 'FirstName', type: 'text' },
        { label: 'Last Name', fieldName: 'LastName', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Birthdate', fieldName: 'Birthdate', type: 'date' }
    ];

    // Wire method to fetch potential false positives from Apex
    @wire(getPotentialFalsePositives)
    wiredPotentialFalsePositives({ error, data }) {
        if (data) {
            this.falsePositiveGroups = data.map((group, index) => ({
                key: `Group_${index}`,
                contacts: group.contactRecords
            }));
        } else if (error) {
            console.error('Error fetching potential false positive records:', error);
        }
    }
}
