public with sharing class StagingStatusController {

    @AuraEnabled(cacheable=true)
    public static Map<String, Integer> getStatusCounts() {
        // Create a map to hold the counts for each picklist value
        Map<String, Integer> statusCounts = new Map<String, Integer>();
        
        // Aggregate query to get counts based on stagingStatus__c field
        List<AggregateResult> results = [SELECT stagingStatus__c, COUNT(Id) 
                                         FROM Staging__c 
                                         GROUP BY stagingStatus__c];

        // Populate the map with the results
        for (AggregateResult ar : results) {
            String status = (String) ar.get('stagingStatus__c');
            Integer count = (Integer) ar.get('expr0'); // Correctly reference the default alias 'expr0'
            statusCounts.put(status, count);
        }

        return statusCounts;
    }
}
