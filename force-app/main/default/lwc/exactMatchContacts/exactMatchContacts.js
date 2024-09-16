import { LightningElement, track, wire } from 'lwc';
import getExactMatchesBetweenStagingAndContact from '@salesforce/apex/StagingContactExactMatchController.getExactMatchesBetweenStagingAndContact';
import { NavigationMixin } from 'lightning/navigation';

export default class ExactMatchContacts extends NavigationMixin(LightningElement) {
    @track matchedGroups = [];

    // Define columns for the staging datatable
    stagingColumns = [
        { 
            label: 'Name', 
            fieldName: 'nameLink', 
            type: 'url', 
            sortable: true, 
            typeAttributes: { label: { fieldName: 'FullName' }, target: '_blank' } 
        },
        { label: 'Email', fieldName: 'Email__c', type: 'email', sortable: true },
        { label: 'Phone', fieldName: 'Phone__c', type: 'phone', sortable: true }
    ];

    // Wire method to fetch exact matches between staging and contacts
    @wire(getExactMatchesBetweenStagingAndContact)
    wiredExactMatches({ error, data }) {
        if (data) {
            this.matchedGroups = data.map(match => {
                const record = match.stagingRecord;
                return {
                    ...record,
                    FullName: `${record.FirstName__c} ${record.LastName__c}`, // Combine First and Last Name
                    nameLink: `/lightning/r/Custom_Object__c/${record.Id}/view` // Record ID link through the name
                };
            });
        } else if (error) {
            console.error('Error fetching exact match records:', error); // Log errors if any
        }
    }

    // Button Handlers
    handleAddToCampaign() {
        // Add logic for adding records to a campaign
        console.log('Add to Campaign button clicked');
    }

    handleSendListEmail() {
        // Add logic for sending list email
        console.log('Send List Email button clicked');
    }

    handleAssignLabel() {
        // Add logic for assigning labels
        console.log('Assign Label button clicked');
    }
}
