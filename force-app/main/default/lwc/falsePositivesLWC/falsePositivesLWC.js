import { LightningElement, track, wire } from 'lwc';
import getPotentialFalsePositives from '@salesforce/apex/FalsePositiveRecordsController.getPotentialFalsePositives';
import createContactsFromRecords from '@salesforce/apex/ContactHandler.createContactsFromRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

export default class FalsePositivesLWC extends NavigationMixin(LightningElement) {
    @track falsePositiveGroups = [];
    @track allStagingRecords = [];
    @track allContactRecords = [];
    @track selectedRows = [];

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

    wiredPotentialFalsePositivesResult;

    @wire(getPotentialFalsePositives)
    wiredPotentialFalsePositives(result) {
        this.wiredPotentialFalsePositivesResult = result;
        const { error, data } = result;
        if (data) {
            this.falsePositiveGroups = data.map((group, index) => ({
                key: `Group_${index}`,
                stagingRecord: group.stagingRecord,
                contactRecords: group.contactRecords
            }));

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
            console.error('Error fetching potential false positive records:', error);
            this.showToast('Error', 'An error occurred while fetching records.', 'error');
        }
    }

    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows.map(row => row.Id);
    }

    handleCreateContact() {
        if (this.selectedRows.length === 0) {
            this.showToast('Error', 'Please select at least one record.', 'error');
            return;
        }

        // Get the full record data for selected rows
        const selectedRecords = this.allStagingRecords.filter(record => 
            this.selectedRows.includes(record.Id)
        );

        createContactsFromRecords({ records: selectedRecords })
            .then(() => {
                this.showToast('Success', 'Contacts created successfully.', 'success');
                return refreshApex(this.wiredPotentialFalsePositivesResult);
            })
            .catch(error => {
                this.showToast('Error', 'An error occurred while creating contacts: ' + error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}