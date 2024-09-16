import { LightningElement, track, wire } from 'lwc';
import getStagingRecords from '@salesforce/apex/StagingController.getStagingRecords';
import { NavigationMixin } from 'lightning/navigation';

export default class StagingRecordViewer extends NavigationMixin(LightningElement) {
    @track stagingRecords; // To hold the fetched staging records

    // Define columns for the datatable
    columns = [
        { 
            label: 'Name', 
            fieldName: 'nameLink', 
            type: 'url', 
            typeAttributes: { label: { fieldName: 'FullName' }, target: '_blank' } 
        },
        { label: 'Email', fieldName: 'Email__c', type: 'email' },
        { label: 'Secondary Email', fieldName: 'Secondary_Email__c', type: 'email' },
        { label: 'Other Email', fieldName: 'Other_Email__c', type: 'email' },
        { label: 'Umail', fieldName: 'umail__c', type: 'email' },
        { label: 'Phone', fieldName: 'Phone__c', type: 'phone' },
        { label: 'Birthdate', fieldName: 'Birthdate__c', type: 'date-local' },
        { label: 'Status', fieldName: 'stagingStatus__c', type: 'text' }
    ];

    // Wire Apex method to property to fetch data
    @wire(getStagingRecords)
    wiredStagingRecords({ error, data }) {
        if (data) {
            this.stagingRecords = data.map(record => {
                return {
                    ...record,
                    FullName: `${record.FirstName__c} ${record.LastName__c}`, // Combine First and Last Name
                    Birthdate__c: record.Birthdate__c ? new Date(record.Birthdate__c).toLocaleDateString() : '',
                    nameLink: `/lightning/r/Custom_Object__c/${record.Id}/view` // Record ID link through the name
                };
            });
        } else if (error) {
            console.error('Error fetching staging records:', error); // Log the error if there's an issue
        }
    }
}
