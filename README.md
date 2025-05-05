# play-with-jq
In this NodeJS project, I've shown an example of how to play with JQ


## Installation

Install play-with-jq with npm
- First clone this project then run 
```bash
  cd play-with-jq
  npm install
  npm start
```
    

### BASIC USE CASE of JQ 

```bash
jq 'map(.gender) | unique' users.json  // Print unique Gender 
jq '.[] | select(.age > 20)' users.json // Select users where age > 20
jq '.[] | select(.age < 20)' users.json // Select users where age < 20

### CURL the API and get similar output for above 
curl http://localhost:3000/api/user | jq '.' 

curl http://localhost:3000/api/user | jq '.[] | select(.age < 20)'

```


curl http://localhost:3000/api/unique-user | jq 'map(.name) | unique'

### Get Average Age: 

```bash
jq '{averageAge: (map(.age) | add / length)}' users.json
```

### API Response Processing
```bash
curl http://localhost:3000/api/user | jq '.[] | {name, gender}'
```


### Find average age
```bash
curl http://localhost:3000/api/user | jq '[.[].age] | add / length'
```

### PRINT as CSV
```bash
curl http://localhost:3000/api/user | jq -r '.[] | [.name, .gender, .age] | @csv'
```



### COUNT items
```bash
curl http://localhost:3000/api/unique-user | jq '. | length'
```

###  Find developers with TypeScript skills on completed projects
```bash
jq '.users[] | select(.role == "developer" and (.skills | contains(["typescript"])) and (.projects[] | select(.status == "completed") | length > 0)) | {name, projects: [.projects[] | select(.status == "completed")]}' users-skills.json
```



#### Join users and projects to create a project assignment report with deadlines using -s (slupr) to combine multiple input

```bash
jq -s '
  [.[0].users[] as $user | 
   .[1].projects[] as $project | 
   $user.projects[] | select(.id == $project.id) | 
   {
     developer: $user.name,
     role: $user.role,
     project: $project.name,
     status: $project.status,
     deadline: $project.deadline
   }
  ] | sort_by(.deadline)
' users-skills.json projects.json
```



### Generate a health report with aggregated metrics by service and region
```bash
jq '
  .serviceMetrics.services | 
  map({
    service: .name,
    totalInstances: (.instances | length),
    problemInstances: [.instances[] | select(.status != "healthy")],
    healthScore: (
      (.instances | map(if .status == "healthy" then 1 else 0 end) | add) / 
      (.instances | length) * 100 | floor
    ),
    avgResponseTime: (.instances | map(.responseTime) | add / length | floor),
    regionMetrics: (
      .instances | group_by(.region) | 
      map({
        region: .[0].region,
        avgResponse: (map(.responseTime) | add / length | floor),
        statuses: map(.status)
      })
    )
  }) |
  sort_by(.healthScore)
' metrics.json
```



### Generate an incident report for problematic pods with restart counts and error details

```bash
jq '
  .items | 
  map(select(.status.phase != "Running" or 
             (.status.containerStatuses[] | .ready == false or .restartCount > 0))) |
  map({
    pod: .metadata.name,
    app: .metadata.labels.app,
    namespace: .metadata.namespace,
    phase: .status.phase,
    age: (now - (.metadata.creationTimestamp | fromdateiso8601) | floor / 86400),
    containers: [
      .status.containerStatuses[] | {
        name,
        ready,
        restartCount,
        status: (
          if .state.running then "Running" 
          elif .state.waiting then "Waiting: \(.state.waiting.reason)" 
          elif .state.terminated then "Terminated: \(.state.terminated.reason)" 
          else "Unknown" end
        ),
        message: (.state.waiting.message // .state.terminated.message // null)
      }
    ]
  })
' pods.json
```







