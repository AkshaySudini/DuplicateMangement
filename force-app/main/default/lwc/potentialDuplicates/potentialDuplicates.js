import { LightningElement, track, wire } from 'lwc';
import getPotentialDuplicates from '@salesforce/apex/PotentialDuplicatesFinder.findPotentialDuplicates';
import { NavigationMixin } from 'lightning/navigation';

export default class PotentialDuplicatesLWC extends NavigationMixin(LightningElement) {
    @track potentialDuplicateGroups = [];
    @track allStagingRecords = []; // Combined list of all staging records
    @track allContactRecords = []; // Combined list of all contact records

    // Define columns for the datatable
    stagingColumns = [
        { 
            label: 'Name', 
            fieldName: 'nameLink', 
            type: 'url', 
            typeAttributes: { label: { fieldName: 'FullName' }, target: '_blank' } 
        },
        { label: 'Email', fieldName: 'Email__c', type: 'email' },
        { label: 'Phone', fieldName: 'Phone__c', type: 'phone' },
        { label: 'Birthdate', fieldName: 'Birthdate__c', type: 'date' }
    ];

    contactColumns = [
        { 
            label: 'Name', 
            fieldName: 'nameLink', 
            type: 'url', 
            typeAttributes: { label: { fieldName: 'FullName' }, target: '_blank' } 
        },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Birthdate', fieldName: 'Birthdate', type: 'date' }
    ];

    // Wire method to fetch potential duplicates from Apex
    @wire(getPotentialDuplicates)
    wiredPotentialDuplicates({ error, data }) {
        if (data) {
            this.potentialDuplicateGroups = data.map((group, index) => ({
                key: `Group_${index}`,
                stagingRecord: group.stagingRecord,
                contactRecords: group.contactRecords
            }));

            // Combine all staging records and contact records into separate arrays with modified data for links
            this.allStagingRecords = data.map(group => {
                const record = group.stagingRecord;
                return {
                    ...record,
                    FullName: `${record.FirstName__c} ${record.LastName__c}`,
                    nameLink: `/lightning/r/Custom_Object__c/${record.Id}/view`
                };
            });

            this.allContactRecords = data.flatMap(group => group.contactRecords.map(record => {
                return {
                    ...record,
                    FullName: `${record.FirstName} ${record.LastName}`,
                    nameLink: `/lightning/r/Contact/${record.Id}/view`
                };
            }));
        } else if (error) {
            console.error('Error fetching potential duplicate records:', error);
        }
    }
}
