import { LightningElement, track, wire } from 'lwc';
import getPotentialDuplicates from '@salesforce/apex/PotentialDuplicatesFinder.findPotentialDuplicates';
import createContactsFromRecords from '@salesforce/apex/ContactHandler.createContactsFromRecords';
import updateStagingRecords from '@salesforce/apex/ContactHandler.updateStagingRecords'; // Import the Apex method to update records
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class PotentialDuplicatesLWC extends NavigationMixin(LightningElement) {
    @track potentialDuplicateGroups = [];
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
        { label: 'Birthdate', fieldName: 'BirthDate__c', type: 'date' },
        { label: 'Status', fieldName: 'stagingStatus__c', type: 'text' } // Added column for staging status
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

    wiredPotentialDuplicatesResult;

    @wire(getPotentialDuplicates)
    wiredPotentialDuplicates(result) {
        this.wiredPotentialDuplicatesResult = result;
        const { error, data } = result;
        if (data) {
            this.potentialDuplicateGroups = data.map((group, index) => ({
                key: `Group_${index}`,
                stagingRecord: group.stagingRecord,
                contactRecords: group.contactRecords
            }));

            // Filter out processed staging records
            this.allStagingRecords = data
                .map(group => group.stagingRecord)
                .filter(record => record.stagingStatus__c !== 'Processed') // Exclude processed records
                .map(record => ({
                    ...record,
                    FullName: `${record.FirstName__c} ${record.LastName__c}`,
                    nameLink: `/lightning/r/Custom_Object__c/${record.Id}/view`,
                    BirthDate__c: record.BirthDate__c ? new Date(record.BirthDate__c).toISOString().slice(0, 10) : ''
                }));

            // Filter out contacts related to processed staging records
            this.allContactRecords = data.flatMap(group => group.contactRecords
                .filter(contact => group.stagingRecord.stagingStatus__c !== 'Processed') // Only show contacts related to non-processed staging records
                .map(record => ({
                    ...record,
                    FullName: `${record.FirstName} ${record.LastName}`,
                    nameLink: `/lightning/r/Contact/${record.Id}/view`
                }))
            );
        } else if (error) {
            console.error('Error fetching potential duplicate records:', error);
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

        const selectedRecords = this.allStagingRecords.filter(record => 
            this.selectedRows.includes(record.Id)
        );

        createContactsFromRecords({ records: selectedRecords })
            .then(() => {
                this.showToast('Success', 'Contacts created and staging records updated to "Processed".', 'success');
                
                // Refresh the data
                return refreshApex(this.wiredPotentialDuplicatesResult);
            })
            .then(() => {
                // After refresh, reapply filters to remove processed records
                const refreshedData = this.wiredPotentialDuplicatesResult.data;

                // Filter out processed staging records
                this.allStagingRecords = refreshedData
                    .map(group => group.stagingRecord)
                    .filter(record => record.stagingStatus__c !== 'Processed') // Exclude processed records
                    .map(record => ({
                        ...record,
                        FullName: `${record.FirstName__c} ${record.LastName__c}`,
                        nameLink: `/lightning/r/Custom_Object__c/${record.Id}/view`,
                        BirthDate__c: record.BirthDate__c ? new Date(record.BirthDate__c).toISOString().slice(0, 10) : ''
                    }));

                // Filter out matched contacts that have been processed
                this.allContactRecords = refreshedData.flatMap(group => group.contactRecords
                    .filter(contact => group.stagingRecord.stagingStatus__c !== 'Processed') // Only show contacts related to non-processed staging records
                    .map(record => ({
                        ...record,
                        FullName: `${record.FirstName} ${record.LastName}`,
                        nameLink: `/lightning/r/Contact/${record.Id}/view`
                    }))
                );
            })
            .catch(error => {
                this.showToast('Error', 'An error occurred while creating contacts: ' + error.body.message, 'error');
            });
    }

    handleDenyAndHold() {
        if (this.selectedRows.length === 0) {
            this.showToast('Error', 'Please select at least one record to deny and hold.', 'error');
            return;
        }

        updateStagingRecords({ recordIds: this.selectedRows, newStatus: 'Rejected' })
            .then(() => {
                this.showToast('Success', 'Selected records have been set to "Rejected".', 'success');
                
                // Refresh the data after update
                return refreshApex(this.wiredPotentialDuplicatesResult);
            })
            .then(() => {
                // Update UI after refresh to show the changed statuses
                const refreshedData = this.wiredPotentialDuplicatesResult.data;

                this.allStagingRecords = refreshedData
                    .map(group => group.stagingRecord)
                    .map(record => ({
                        ...record,
                        FullName: `${record.FirstName__c} ${record.LastName__c}`,
                        nameLink: `/lightning/r/Custom_Object__c/${record.Id}/view`,
                        BirthDate__c: record.BirthDate__c ? new Date(record.BirthDate__c).toISOString().slice(0, 10) : ''
                    }));
            })
            .catch(error => {
                this.showToast('Error', 'An error occurred while updating records: ' + error.body.message, 'error');
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
