import { LightningElement, track, wire } from 'lwc';
import getExactMatchesBetweenStagingAndContact from '@salesforce/apex/StagingContactExactMatchController.getExactMatchesBetweenStagingAndContact';
import createContactsFromRecords from '@salesforce/apex/ContactHandler.createContactsFromRecords';
import deleteRecords from '@salesforce/apex/ContactHandler.deleteRecords'; // Import the Apex method for deletion
import updateStagingRecords from '@salesforce/apex/ContactHandler.updateStagingRecords'; // Import the Apex method to update records
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

export default class ExactMatchContacts extends NavigationMixin(LightningElement) {
    @track matchedGroups = [];
    @track stagingRecords = [];
    @track contactRecords = [];
    @track selectedRows = []; // Holds selected row IDs

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
        { label: 'Phone', fieldName: 'Phone__c', type: 'phone', sortable: true },
        { label: 'Status', fieldName: 'stagingStatus__c', type: 'text' } // Added column for staging status
    ];

    // Define columns for the contact datatable
    contactColumns = [
        { 
            label: 'Name', 
            fieldName: 'nameLink', 
            type: 'url', 
            typeAttributes: { label: { fieldName: 'FullName' }, target: '_blank' } 
        },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' }
     //   { label: 'Birthdate', fieldName: 'Birthdate', type: 'date' }
    ];

    wiredExactMatchesResult;

    // Wire method to fetch exact matches between staging and contacts
    @wire(getExactMatchesBetweenStagingAndContact)
    wiredExactMatches(result) {
        this.wiredExactMatchesResult = result;
        const { error, data } = result;
        if (data) {
            this.matchedGroups = data;
            this.processData(data);
        } else if (error) {
            console.error('Error fetching exact match records:', error); // Log errors if any
            this.showToast('Error', 'An error occurred while fetching records.', 'error');
        }
    }

    // Method to process and separate staging and contact records
    processData(data) {
        this.stagingRecords = data.map(match => {
            const record = match.stagingRecord;
            return {
                ...record,
                FullName: `${record.FirstName__c} ${record.LastName__c}`, // Combine First and Last Name
                nameLink: `/lightning/r/Custom_Object__c/${record.Id}/view` // Record ID link through the name
            };
        });

        this.contactRecords = data.flatMap(match => {
            return match.contactRecords.map(contact => {
                return {
                    ...contact,
                    FullName: `${contact.FirstName} ${contact.LastName}`,
                    nameLink: `/lightning/r/Contact/${contact.Id}/view`
                };
            });
        });
    }

    // Handle row selection in datatable
    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows.map(row => row.Id); // Update selected rows by extracting Ids
    }

    // Handle the creation of contacts from selected rows
    handleCreateContact() {
        if (this.selectedRows.length === 0) {
            this.showToast('Error', 'Please select at least one record.', 'error');
            return;
        }

        const selectedRecords = this.stagingRecords.filter(record => 
            this.selectedRows.includes(record.Id)
        );

        createContactsFromRecords({ records: selectedRecords })
            .then(() => {
                this.showToast('Success', 'Contacts created and staging records updated to "Processed".', 'success');
                
                // Refresh the data
                return refreshApex(this.wiredExactMatchesResult);
            })
            .then(() => {
                // Remove processed records from the datatables
                this.stagingRecords = this.stagingRecords.filter(record => 
                    record.stagingStatus__c !== 'Processed'
                );
                
                this.contactRecords = this.contactRecords.filter(contact => {
                    return !this.selectedRows.includes(contact.stagingRecordId);
                });
            })
            .catch(error => {
                this.showToast('Error', 'An error occurred while creating contacts: ' + error.body.message, 'error');
            });
    }

    // Handle deletion of selected records
    handleDeleteRecords() {
        if (this.selectedRows.length === 0) {
            this.showToast('Error', 'Please select at least one record to delete.', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete the selected records? This action cannot be undone.')) {
            deleteRecords({ recordIds: this.selectedRows })
                .then(() => {
                    this.showToast('Success', 'Selected records have been deleted.', 'success');
                    
                    // Remove deleted records from the datatables
                    this.stagingRecords = this.stagingRecords.filter(record => 
                        !this.selectedRows.includes(record.Id)
                    );

                    this.contactRecords = this.contactRecords.filter(contact => {
                        return !this.selectedRows.includes(contact.stagingRecordId);
                    });

                    this.selectedRows = [];
                    
                    return refreshApex(this.wiredExactMatchesResult);
                })
                .catch(error => {
                    this.showToast('Error', 'An error occurred while deleting records: ' + error.body.message, 'error');
                });
        }
    }

    // Handle Deny and Hold to set status to Rejected
    handleDenyAndHold() {
        if (this.selectedRows.length === 0) {
            this.showToast('Error', 'Please select at least one record to deny and hold.', 'error');
            return;
        }

        updateStagingRecords({ recordIds: this.selectedRows, newStatus: 'Rejected' })
            .then(() => {
                this.showToast('Success', 'Selected records have been set to "Rejected".', 'success');
                
                // Refresh the data after update
                return refreshApex(this.wiredExactMatchesResult);
            })
            .then(() => {
                // Update UI after refresh to show the changed statuses
                const refreshedData = this.wiredExactMatchesResult.data;

                this.stagingRecords = refreshedData
                    .map(match => match.stagingRecord)
                    .map(record => ({
                        ...record,
                        FullName: `${record.FirstName__c} ${record.LastName__c}`,
                        nameLink: `/lightning/r/Custom_Object__c/${record.Id}/view`
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
