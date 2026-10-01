# Domain 4: Design Cost-Optimized Architectures (20%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain4.html>

---

## Task 4.1: Design cost-optimized storage solutions

**1.** An insurance company's claim documents are accessed frequently for the first 30 days while a claim is active, rarely touched for the next 60 days during appeals, and then must be archived for 7 years total to satisfy a state retention law — with retrieval allowed to take up to 12 hours if it's ever needed. What is the MOST cost-effective lifecycle?
- A. S3 Standard for 30 days → S3 Glacier Flexible Retrieval for the rest of the 7 years
- B. S3 Standard → S3 Standard-IA after 30 days → S3 Glacier Deep Archive after 90 days
- C. S3 Glacier Instant Retrieval from day 1 → S3 Glacier Deep Archive after 90 days
- D. S3 One Zone-IA from day 1 → S3 Glacier Flexible Retrieval after 90 days

<details><summary>Answer</summary>

**B.** Standard retrieval from Deep Archive completes within 12 hours, which meets the requirement at the lowest storage cost for data that's rarely needed after 90 days.

```diagram
*S3 Standard | days 0-30 -(lifecycle: day 30)-> *Standard-IA | days 30-90 -(lifecycle: day 90)-> *Glacier Deep Archive | to year 7, restore within 12 h
```

Why not the others:
- **A.** Flexible Retrieval costs more than Deep Archive over 7 years, and moving at day 30 adds retrieval waits and fees during the appeals period.
- **C.** Glacier Instant Retrieval charges per retrieval, which gets expensive during the first 30 days of frequent access.
- **D.** One Zone-IA charges per retrieval during the busy first 30 days and keeps data in one AZ, and Flexible Retrieval costs more than Deep Archive.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html>
</details>

**2.** A media company ingests user-generated content whose access patterns are impossible to predict — some clips go viral within hours, others are never watched again — and access can shift unpredictably over a file's life. Leadership wants a storage class that automatically optimizes cost without anyone monitoring it, and without retrieval fees when access patterns change. Which fits?
- A. S3 Glacier Flexible Retrieval
- B. S3 One Zone-IA
- C. S3 Standard-IA
- D. S3 Intelligent-Tiering

<details><summary>Answer</summary>

**D.** S3 Intelligent-Tiering automatically moves objects between access tiers based on observed usage, with no retrieval fees, which is exactly suited to unpredictable, changing access patterns.

```diagram
New upload -> *Intelligent-Tiering -(not accessed 30 days)-> Infrequent Access tier -(accessed again, no retrieval fee)-> Frequent Access tier
```

Why not the others:
- **A.** Flexible Retrieval is an archive class: restores take minutes to hours and cost extra, which doesn't suit content that can suddenly go viral.
- **B.** One Zone-IA charges per retrieval, keeps data in one AZ, and doesn't adjust to access patterns on its own.
- **C.** Standard-IA charges per retrieval, so popular clips would cost more, and it doesn't adjust to access patterns on its own.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html>
</details>

**3.** A company's secondary backup copies can be regenerated easily from the primary source if lost, are accessed rarely, but still need millisecond access on the rare occasion someone needs one. What is the cheapest storage class that still gives millisecond access?
- A. S3 One Zone-IA
- B. S3 Glacier Deep Archive
- C. S3 Standard
- D. S3 Standard-IA

<details><summary>Answer</summary>

**A.** One Zone-IA is the cheapest class with millisecond access, and storing data in a single AZ is an acceptable trade-off here since the backup copy can simply be regenerated if that AZ is lost.

```diagram
Primary data -(regenerate if lost)-> *S3 One Zone-IA | one AZ, cheapest ms access -(rare read, milliseconds)-> Restore job
```

Why not the others:
- **B.** Deep Archive retrievals take hours, not milliseconds.
- **C.** S3 Standard costs more to store than the IA classes, which is wasteful for rarely accessed data.
- **D.** Standard-IA stores data across multiple AZs, which costs more than One Zone-IA. That resilience isn't needed for copies that can be regenerated.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html>
</details>

**4.** A hospital's diagnostic images are, on average, only pulled up about once a quarter after the initial diagnosis, but when a doctor does request one during a follow-up visit, it must load in milliseconds, not hours. Which storage class fits?
- A. S3 Standard
- B. S3 Glacier Flexible Retrieval
- C. S3 Glacier Instant Retrieval
- D. S3 Glacier Deep Archive

<details><summary>Answer</summary>

**C.** Glacier Instant Retrieval is priced for infrequently accessed data (like quarterly access) but still returns objects with millisecond latency, unlike Glacier Flexible Retrieval or Deep Archive, which involve a retrieval wait.

```diagram
Doctor's follow-up visit -(about once a quarter)-> *Glacier Instant Retrieval | low storage cost -(milliseconds)-> Diagnostic image
```

Why not the others:
- **A.** S3 Standard costs more to store than Glacier Instant Retrieval, which is wasteful for data read about once a quarter.
- **B.** Flexible Retrieval restores take minutes to hours, not milliseconds.
- **D.** Deep Archive retrievals take hours, not milliseconds.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html>
</details>

**5.** A bucket with versioning enabled — originally turned on so a bad deploy could always be rolled back — has quietly grown to several times its expected size because old versions of frequently updated files are never removed. How should costs be controlled going forward?
- A. A lifecycle rule that expires noncurrent versions after N days
- B. Suspend versioning on the bucket, which removes the old versions
- C. Turn on S3 Object Lock in Governance mode for the bucket
- D. Turn on S3 Intelligent-Tiering for the current versions only

<details><summary>Answer</summary>

**A.** A lifecycle rule that expires noncurrent versions removes old versions after a set number of days while keeping rollback ability for recent changes. Suspending versioning stops new versions but doesn't delete versions that already exist.

```diagram
Object v5 | current & v4 & v3 & v2 | noncurrent -> *Lifecycle rule | expire noncurrent after N days -> Only recent versions kept
```

Why not the others:
- **B.** Suspending versioning stops new versions from being created, but it doesn't delete the versions that already exist.
- **C.** Object Lock prevents versions from being deleted, which makes the storage growth worse.
- **D.** Intelligent-Tiering for current versions doesn't touch the old versions that are driving the cost.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html>
</details>

**6.** A company with 40 AWS accounts and hundreds of S3 buckets wants one place that shows storage usage trends and cost-optimization recommendations across the whole organization, rather than checking each bucket's metrics individually. Which S3 tool gives that?
- A. S3 Inventory reports
- B. S3 Storage Lens
- C. Amazon Macie
- D. AWS CloudTrail data events

<details><summary>Answer</summary>

**B.** S3 Storage Lens provides organization-wide visibility into storage usage and activity metrics, along with cost-optimization recommendations, across every account and bucket in scope.

```diagram
Account 1 buckets & Account 2 buckets & Account 40 buckets -> *S3 Storage Lens | organization dashboard -> Usage trends & Cost recommendations
```

Why not the others:
- **A.** S3 Inventory lists the objects in a bucket. It doesn't provide an organization-wide dashboard or cost recommendations.
- **C.** Macie discovers sensitive data in S3. It doesn't analyze storage usage or cost.
- **D.** CloudTrail data events log object-level API calls (at extra cost). They don't summarize usage or recommend savings.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage_lens.html>
</details>

**7.** A cost review flags dozens of gp2 volumes across the fleet that were provisioned years ago and never revisited. The team wants a low-risk change (no downtime) that usually lowers cost by about 20% while keeping or improving performance. What should they do?
- A. Migrate them to gp3 with Elastic Volumes
- B. Convert them to st1 Throughput Optimized HDD
- C. Move the data to instance store volumes
- D. Migrate them to io2 with the same IOPS

<details><summary>Answer</summary>

**A.** gp3 is roughly 20% cheaper per GB than gp2 while matching or beating its baseline performance, and Elastic Volumes changes the volume type without downtime.

```diagram
gp2 volume -> *Elastic Volumes | change type, no downtime -> gp3 volume | about 20% cheaper
```

Why not the others:
- **B.** st1 is cheaper, but it's a hard disk volume: much slower for random I/O and not allowed as a boot volume.
- **C.** Instance store is temporary storage that's lost when an instance stops, so it can't replace EBS volumes.
- **D.** io2 costs more than gp2, so it increases cost.

Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/requesting-ebs-volume-modifications.html>
</details>

**8.** A company keeps a year's worth of EBS snapshots purely to satisfy a compliance requirement — they're almost never restored, and the team can tolerate a 24-to-72-hour wait on the rare occasion one is needed. How can storage costs for these snapshots be cut?
- A. Convert the snapshots to AMIs, which are stored at no charge
- B. Move the snapshots to the EBS Snapshots Archive tier
- C. Move the snapshots to S3 Glacier Deep Archive with a lifecycle rule
- D. Copy the snapshots to a cheaper Region and delete the originals

<details><summary>Answer</summary>

**B.** The EBS Snapshots Archive tier is up to 75% cheaper than standard snapshot storage, with a minimum 90-day storage duration and restores that take 24–72 hours — matching this exact access pattern.

```diagram
EBS snapshot | standard tier -(archive)-> *Snapshots Archive tier | up to 75% cheaper, 90-day minimum -(restore 24-72 h)-> Standard snapshot
```

Why not the others:
- **A.** AMIs are backed by EBS snapshots, so the snapshot storage is still billed.
- **C.** EBS snapshots are managed by EBS, not stored in your S3 buckets, so S3 lifecycle rules can't move them to Glacier.
- **D.** Copying to another Region adds cross-Region transfer charges and still bills standard snapshot storage. The archive tier is far cheaper.

Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-archive.html>
</details>

**9.** An EFS file system used by a content-management system holds millions of files, most of which are barely touched 30 days after upload, but the team doesn't want to build and maintain a separate archival process by hand. What reduces cost automatically?
- A. Switch the file system to Max I/O performance mode
- B. Switch the file system to Provisioned Throughput mode
- C. EFS lifecycle management to the IA or Archive class
- D. Move the data to gp3 EBS volumes attached to each instance

<details><summary>Answer</summary>

**C.** EFS lifecycle management automatically moves files that haven't been accessed for a configurable period into the lower-cost IA or Archive storage classes, with no application changes needed.

```diagram
File not accessed for 30 days -> *EFS lifecycle management -> EFS IA -(longer)-> EFS Archive
File accessed again -(optional: move back)-> EFS Standard
```

Why not the others:
- **A.** Max I/O is a performance mode for highly parallel workloads. It doesn't change storage cost.
- **B.** Provisioned Throughput adds throughput charges. It doesn't reduce storage cost.
- **D.** EBS volumes can't be shared as one file system across instances the way EFS is, so the CMS would break.

Resource: <https://docs.aws.amazon.com/efs/latest/ug/lifecycle-management-efs.html>
</details>

**10.** A company's backup software has supported physical tape libraries for over a decade, and rewriting the backup jobs to target a different kind of storage isn't on the roadmap this year — but it wants to get rid of the physical tape hardware itself. What should it use?
- A. Amazon EFS with the EFS Archive class
- B. AWS Storage Gateway Tape Gateway
- C. AWS Storage Gateway S3 File Gateway
- D. AWS DataSync with a daily scheduled task

<details><summary>Answer</summary>

**B.** Tape Gateway presents a virtual tape library that existing backup software can keep using unchanged, while the tapes themselves are actually stored in S3 and S3 Glacier.

```diagram
Backup software | unchanged -(iSCSI virtual tape library)-> [On premises: *Tape Gateway] -> Virtual tapes in S3 -(archive)-> S3 Glacier
```

Why not the others:
- **A.** EFS is a file system. Backup software written for tape can't use it without the rewrite the company wants to avoid.
- **C.** S3 File Gateway presents NFS and SMB file shares, not a tape library.
- **D.** DataSync copies files between storage systems. The backup software would still need a tape target.

Resource: <https://docs.aws.amazon.com/storagegateway/latest/tgw/WhatIsStorageGateway.html>
</details>

**41.** A research lab keeps 2 PB of old satellite images in S3 Glacier Flexible Retrieval. A new project needs about 400 TB of them restored for reprocessing, but the project won't start for two weeks, so a restore that takes many hours is perfectly acceptable. Which retrieval option minimizes the cost of the restore?
- A. Expedited retrieval, for every object
- B. Standard retrieval, with provisioned capacity
- C. Bulk retrieval, the lowest-cost option
- D. Copy the objects to S3 Standard-IA first

<details><summary>Answer</summary>

**C.** Bulk retrieval is the lowest-cost way to restore data from S3 Glacier Flexible Retrieval. It typically completes within 5 to 12 hours, which is fine when the data isn't needed urgently.

```diagram
400 TB in Glacier Flexible Retrieval -> *Bulk retrieval | 5-12 h, lowest cost -> Temporary restored copies -> Reprocessing
```

Why not the others:
- **A.** Expedited retrievals return data in minutes, but they're the most expensive option, which is wasted money here.
- **B.** Provisioned capacity guarantees capacity for Expedited retrievals and adds cost. It doesn't make Standard retrievals cheaper.
- **D.** Objects in Glacier Flexible Retrieval must be restored before they can be copied, so this still needs a retrieval and adds storage cost.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects-retrieval-options.html>
</details>

**42.** An S3 bucket's storage bill is much higher than the total size of the objects listed in it. Investigation shows that a video-upload app often starts multipart uploads that fail partway through and are never completed or cleaned up, and the uploaded parts keep incurring storage charges. What is the simplest ongoing fix?
- A. A lifecycle rule that aborts incomplete multipart uploads after 7 days
- B. S3 Versioning, so that incomplete uploads can be rolled back
- C. A lifecycle rule that transitions all objects to Glacier after 7 days
- D. S3 Transfer Acceleration, so that fewer uploads fail partway

<details><summary>Answer</summary>

**A.** A lifecycle rule with `AbortIncompleteMultipartUpload` automatically removes the parts of uploads that haven't completed within a set number of days, so they stop incurring storage charges.

```diagram
Failed multipart uploads | orphaned parts -> *Lifecycle rule | AbortIncompleteMultipartUpload after 7 days -> Parts deleted
```

Why not the others:
- **B.** Versioning keeps older versions of completed objects. It doesn't clean up parts from failed uploads, and it can increase storage.
- **C.** Transitioning objects changes the storage class of completed objects. It doesn't remove the leftover parts of failed uploads.
- **D.** Faster uploads might fail less often, but leftover parts from uploads that still fail would keep piling up.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html>
</details>

**43.** Engineers take EBS snapshots of 150 volumes by hand before each deployment, and nobody ever deletes them, so the account now holds thousands of snapshots going back three years. The company only needs daily snapshots kept for 14 days. What should it use to create and clean up snapshots automatically?
- A. S3 lifecycle rules on the bucket that stores the snapshots
- B. EBS Snapshots Archive for every snapshot as soon as it's made
- C. AWS Config rules that flag snapshots older than 14 days
- D. Amazon Data Lifecycle Manager policies with 14-day retention

<details><summary>Answer</summary>

**D.** Data Lifecycle Manager creates EBS snapshots on a schedule for tagged volumes and deletes them automatically according to a retention rule, such as keeping 14 days of daily snapshots.

```diagram
Tagged volumes -> *Data Lifecycle Manager policy | daily -> Snapshots | 14-day retention -(older)-> Deleted automatically
```

Why not the others:
- **A.** EBS snapshots aren't stored in a bucket you control, so S3 lifecycle rules can't manage them.
- **B.** The archive tier suits rarely restored, long-term snapshots, with a 90-day minimum. It doesn't delete anything and would cost more for 14-day retention.
- **C.** Config rules can flag old snapshots, but they don't create or delete them.

Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-lifecycle.html>
</details>

**44.** A company already stores 800 TB of user uploads in S3 Intelligent-Tiering. Analysis shows that more than half of the objects haven't been accessed for over six months, and the business is fine with waiting several hours to retrieve those rare old objects. How can storage costs be reduced further, while keeping Intelligent-Tiering's automatic tiering?
- A. Move every object to S3 Standard-IA with a lifecycle rule
- B. Turn on the Archive and Deep Archive Access tiers
- C. Turn on S3 Versioning for the Intelligent-Tiering bucket
- D. Replicate the bucket to a lower-cost AWS Region

<details><summary>Answer</summary>

**B.** Intelligent-Tiering's optional archive tiers must be turned on. Once they are, objects not accessed for at least 90 days move to Archive Access and after 180 days to Deep Archive Access, for much lower storage costs, with retrieval taking minutes to hours.

```diagram
Intelligent-Tiering object -(90 days no access)-> *Archive Access tier -(180 days)-> *Deep Archive Access tier
Rare request -(restore: minutes to hours)-> Object back in Frequent Access
```

Why not the others:
- **A.** Standard-IA costs more than the archive tiers, charges per retrieval, and gives up automatic tiering.
- **C.** Versioning keeps previous object versions, which adds storage rather than reducing it.
- **D.** Replication adds a second copy of the data, which increases cost.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering-overview.html>
</details>

**45.** A development team uses an Amazon EFS file system to share build caches between test instances that all run in one Availability Zone. The data can easily be regenerated if it's lost, and the team wants to reduce storage cost without changing how the instances mount the file system over NFS. What should they use?
- A. An EFS Regional file system in Max I/O mode
- B. S3 Standard, with the build caches uploaded there
- C. An EFS One Zone file system
- D. EBS gp3 volumes attached to each test instance

<details><summary>Answer</summary>

**C.** One Zone file systems store data in a single Availability Zone, which costs less than Regional storage across several AZs. That's a reasonable trade-off for data that can be regenerated, and instances still mount it over NFS.

```diagram
[One AZ: Test instances -(NFS)-> *EFS One Zone file system | lower cost]
```

Why not the others:
- **A.** Max I/O is a performance mode that doesn't reduce cost, and Regional storage costs more than One Zone.
- **B.** S3 isn't an NFS file system, so the instances and build tools would need changing.
- **D.** EBS volumes can't be shared by several instances as one file system the way EFS can.

Resource: <https://docs.aws.amazon.com/efs/latest/ug/features.html>
</details>

---

## Task 4.2: Design cost-optimized compute solutions

**11.** A research team runs a fault-tolerant batch simulation that checkpoints its progress and can be interrupted and restarted from the last checkpoint without losing meaningful work. Cost matters far more than guaranteed availability for this particular workload. Which purchasing option is cheapest?
- A. Spot Instances
- B. Dedicated Hosts
- C. On-Demand Instances
- D. 3-year Reserved Instances

<details><summary>Answer</summary>

**A.** Spot Instances can cost up to 90% less than On-Demand and come with a 2-minute interruption notice, which a checkpointing, fault-tolerant workload can absorb easily.

```diagram
Batch job -> *Spot Instance | up to 90% off -(2-minute interruption notice)-> Checkpoint saved -> New Spot Instance resumes
```

Why not the others:
- **B.** Dedicated Hosts are the most expensive option, paying for a whole physical server.
- **C.** On-Demand is full price, with no discount for being able to tolerate interruptions.
- **D.** A 3-year reservation is a commitment you pay for whether or not the simulation runs, and Spot is usually far cheaper for interruptible work.

Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html>
</details>

**12.** A company runs steady 24/7 workloads spread across EC2, Fargate, and Lambda, and its architecture team expects to shift instance families — and possibly Regions — over the next year as they modernize. They want a commitment discount flexible enough to follow that. What should they buy?
- A. Spot Instances
- B. EC2 Instance Savings Plans
- C. Compute Savings Plans
- D. Standard Reserved Instances

<details><summary>Answer</summary>

**C.** Compute Savings Plans apply automatically across instance families, Regions, and compute services (EC2, Fargate, Lambda), unlike EC2 Instance Savings Plans, which give a higher discount but lock in one instance family in one Region.

```diagram
*Compute Savings Plan | $/hour commitment -> EC2 any family, any Region & AWS Fargate & AWS Lambda
```

Why not the others:
- **A.** Spot Instances aren't a commitment discount, can be interrupted, and don't apply to Lambda.
- **B.** EC2 Instance Savings Plans only cover one instance family in one Region, and don't cover Fargate or Lambda.
- **D.** Standard Reserved Instances apply to EC2 only and are tied to specific instance attributes, so they don't follow family or Region changes.

Resource: <https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html>
</details>

**13.** A conference organizer must guarantee EC2 capacity in a specific Availability Zone for a two-week trade show, but doesn't want any multi-year commitment for capacity it will only need twice a year. What should it use?
- A. On-Demand Capacity Reservations
- B. Standard Reserved Instances (3-year)
- C. Compute Savings Plans (1-year)
- D. Spot Instances with a maximum price

<details><summary>Answer</summary>

**A.** On-Demand Capacity Reservations reserve capacity in a specific AZ for as long as needed, with no long-term commitment — you simply pay the On-Demand rate while the reservation is active.

```diagram
*On-Demand Capacity Reservation | specific AZ, no term -> Trade show instances | 2 weeks -(cancel afterwards)-> No commitment left
```

Why not the others:
- **B.** A 3-year reservation is exactly the long-term commitment the organizer wants to avoid.
- **C.** Savings Plans give a discount but don't reserve capacity, and they're a 1-year commitment.
- **D.** Spot Instances can be interrupted at any time and guarantee no capacity.

Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-capacity-reservations.html>
</details>

**14.** A company is bringing its own Windows Server and SQL Server licenses (BYOL) to AWS, and the licensing terms require visibility into the exact physical sockets and cores the software runs on. Which option fits?
- A. Dedicated Instances
- B. Shared tenancy
- C. Spot Instances
- D. Dedicated Hosts

<details><summary>Answer</summary>

**D.** Dedicated Hosts give visibility into, and control over, the specific physical server (including sockets and cores), which is what per-socket or per-core BYOL licensing terms typically require. Dedicated Instances only guarantee single-tenant hardware, without that visibility.

```diagram
BYOL Windows / SQL Server -> *Dedicated Host | visible sockets and cores -> License compliance
```

Why not the others:
- **A.** Dedicated Instances run on single-tenant hardware but don't give visibility into physical sockets and cores.
- **B.** Shared tenancy runs on hardware shared with other customers, with no socket or core visibility.
- **C.** Spot Instances run on shared tenancy by default and can be interrupted, so they don't meet the licensing terms.

Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts-overview.html>
</details>

**15.** A web tier has a steady baseline of traffic around the clock, plus unpredictable peaks a few times a day that last only a few minutes. The team wants to avoid provisioning for the peak load all day. What is the most cost-effective Auto Scaling group design?
- A. All Spot Instances of a single instance type, sized for the peak
- B. All On-Demand Instances, sized for the peak and running around the clock
- C. Dedicated Hosts for the baseline and On-Demand Instances for the peaks
- D. Mixed instances: Savings Plans-covered On-Demand baseline, Spot for the peaks

<details><summary>Answer</summary>

**D.** Covering the predictable baseline with discounted, committed On-Demand capacity and bursting onto cheaper Spot Instances for short, unpredictable peaks avoids paying peak-sized On-Demand rates around the clock.

```diagram
[Auto Scaling group, mixed instances policy: *Baseline | On-Demand, Savings Plans & *Peaks | Spot Instances]
Traffic peak, a few minutes -> Spot capacity added -> Removed after the peak
```

Why not the others:
- **A.** All-Spot puts the baseline at risk of interruption, a single instance type limits available Spot capacity, and sizing for the peak wastes money.
- **B.** Paying On-Demand rates for peak capacity around the clock is the waste the team wants to avoid.
- **C.** Dedicated Hosts are expensive, and On-Demand for short peaks costs more than Spot.

Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-mixed-instances-groups.html>
</details>

**16.** An engineering team wants a change that can improve price-performance by up to 40% for many of their Linux workloads, without a major re-architecture — just a rebuild and redeploy for compatible workloads. Which change fits?
- A. Move to instances with NVMe instance store volumes
- B. Move to AWS Graviton (Arm-based) instances
- C. Move to larger x86 instances and consolidate workloads
- D. Move to Dedicated Hosts with the same instance type

<details><summary>Answer</summary>

**B.** AWS Graviton instances often deliver up to 40% better price-performance than comparable x86 instances for compatible Linux workloads, typically requiring just a rebuild for the Arm architecture.

```diagram
x86 instance -(rebuild for Arm)-> *Graviton instance | up to 40% better price-performance
```

Why not the others:
- **A.** Instance store improves local storage performance for workloads that need it. It isn't a general price-performance gain.
- **C.** Larger x86 instances cost more, and consolidation doesn't improve price-performance by itself.
- **D.** Dedicated Hosts cost more for the same instance type.

Resource: <https://aws.amazon.com/ec2/graviton/>
</details>

**17.** Development and test EC2 instances currently run 24/7, but the engineering team only actually uses them roughly 9 AM to 6 PM on weekdays. What is an easy way to cut cost without changing the instances themselves?
- A. Resize them to a larger type so work finishes sooner
- B. Move them to Dedicated Hosts to reduce the licensing cost
- C. Buy 3-year Reserved Instances that cover all of the instances
- D. Stop them outside business hours with Instance Scheduler on AWS

<details><summary>Answer</summary>

**D.** Stopping instances outside business hours (through Instance Scheduler on AWS, or scheduled Auto Scaling actions for instances in an ASG) avoids paying for the roughly two-thirds of the day they sit unused.

```diagram
*Instance Scheduler -(8:45 AM weekdays: start)-> Dev / test instances
*Instance Scheduler -(6 PM and weekends: stop)-> Dev / test instances | no compute charge
```

Why not the others:
- **A.** Larger instances cost more per hour and still run all day.
- **B.** Dedicated Hosts cost more, and licensing isn't the problem here.
- **C.** Reserved Instances discount each hour but still pay for all the hours the instances sit unused.

Resource: <https://docs.aws.amazon.com/solutions/latest/instance-scheduler-on-aws/solution-overview.html>
</details>

**18.** A lightly used internal API currently runs on two always-on EC2 instances just in case traffic spikes, but logs show it actually gets only a few thousand requests a day, mostly during business hours. What is likely the MOST cost-effective re-architecture?
- A. An EC2 Auto Scaling group with a minimum of four instances
- B. Amazon ECS on EC2 with four tasks across two instances
- C. Amazon API Gateway with AWS Lambda functions
- D. Larger EC2 instances behind an Application Load Balancer

<details><summary>Answer</summary>

**C.** At a few thousand requests a day, paying per request and per millisecond of execution with API Gateway and Lambda costs far less than keeping any number of EC2 instances running around the clock.

```diagram
Few thousand requests a day -> *API Gateway -> *Lambda | pay per request and ms
Two always-on EC2 instances -x(paying while idle)-> Retired
```

Why not the others:
- **A.** Four always-on instances cost more than the current two.
- **B.** Containers on EC2 still mean paying for two instances around the clock.
- **D.** Larger instances plus a load balancer cost more, not less.

Resource: <https://docs.aws.amazon.com/lambda/latest/dg/welcome.html>
</details>

**19.** After a surprising bill last month, a company wants a single tool that flags idle and underused resources across the account — low-utilization EC2 instances, unassociated Elastic IPs, and similar waste — as part of routine cost checks. Which tool does this?
- A. AWS Artifact reports
- B. AWS X-Ray
- C. AWS Trusted Advisor
- D. Amazon Inspector

<details><summary>Answer</summary>

**C.** Trusted Advisor's cost optimization checks specifically flag things like low-utilization EC2 instances and unassociated Elastic IP addresses, among other waste indicators.

```diagram
*Trusted Advisor | cost checks -> Low-utilization EC2 & Unassociated Elastic IPs & Idle load balancers
```

Why not the others:
- **A.** AWS Artifact provides AWS's compliance reports, not cost checks.
- **B.** X-Ray traces application requests. It doesn't look for idle resources.
- **D.** Amazon Inspector scans for software vulnerabilities, not wasted spend.

Resource: <https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html>
</details>

**20.** Finance wants an automatic alert the moment AWS's own forecast shows this month's spend is on track to exceed $10,000, rather than waiting to find out at the end of the month. What should it use?
- A. An AWS CloudTrail trail with Insights events
- B. AWS Cost Explorer with a saved report
- C. An AWS Config rule that checks instance types
- D. AWS Budgets with a forecast-based alert

<details><summary>Answer</summary>

**D.** AWS Budgets can alert based on forecasted spend, not just actual spend so far, which is exactly what's needed to get ahead of a projected overage. (AWS Cost Anomaly Detection is the complementary tool for catching unusual spikes that a fixed threshold might miss.)

```diagram
Month-to-date spend -> AWS forecast -(forecast > $10,000)-> *AWS Budgets alert -> Finance | email or SNS
```

Why not the others:
- **A.** CloudTrail Insights detects unusual API activity, not spending forecasts.
- **B.** Cost Explorer reports show and forecast spending, but a saved report doesn't send alerts.
- **C.** Config rules check resource configurations, not spending.

Resource: <https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html>
</details>

**21.** Finance wants to see exactly how much of the AWS bill each of the company's five product teams is responsible for, using the single shared account they all deploy into. What must be done?
- A. Enable VPC Flow Logs and add up the traffic by department
- B. Apply and activate cost allocation tags, or use separate accounts
- C. Put each department's users in its own IAM group
- D. Deploy each department's resources in a separate Region

<details><summary>Answer</summary>

**B.** Cost allocation tags, once applied to resources and activated in Billing, let costs be broken out by tag value (such as team or department) in Cost Explorer and billing reports. Separate accounts under consolidated billing achieve the same split cleanly if the teams are split that way instead.

```diagram
Resources | tag team=alpha, team=beta -(activate in Billing)-> *Cost allocation tags -> Cost Explorer | cost per team
```

Why not the others:
- **A.** Flow Logs record network traffic, not the cost of each team's resources.
- **C.** IAM groups control permissions. Costs aren't attributed to whoever created a resource.
- **D.** Splitting by Region forces an arbitrary architecture on the teams and still can't attribute shared resources.

Resource: <https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html>
</details>

**22.** A company's 15 AWS accounts, each billed separately today, individually fall short of the usage thresholds needed to reach volume pricing tiers, and none of them can fully use the Reserved Instances or Savings Plans another account purchased. Which AWS Organizations feature fixes both problems?
- A. Tag policies
- B. Service control policies
- C. Consolidated billing
- D. Delegated administrator

<details><summary>Answer</summary>

**C.** Consolidated billing combines usage across member accounts so the organization can reach volume pricing tiers together, and it shares Reserved Instance and Savings Plans discounts across accounts by default.

```diagram
Account 1 & Account 2 & Account 15 -> *Consolidated billing | management account -> Combined volume tiers & Shared RI and Savings Plans discounts
```

Why not the others:
- **A.** Tag policies standardize how resources are tagged. They don't combine usage or share discounts.
- **B.** SCPs limit what accounts can do. They have nothing to do with billing.
- **D.** A delegated administrator lets a member account manage a service for the organization. It doesn't affect pricing.

Resource: <https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html>
</details>

**46.** Last month, a developer's misconfigured script launched dozens of large instances in an unused Region, and nobody noticed until the invoice arrived. The company's spending varies a lot from week to week, so fixed budget thresholds would trigger false alarms constantly. What should it use to be alerted quickly to unusual spending patterns?
- A. AWS Cost Anomaly Detection with alert subscriptions
- B. AWS Budgets with one fixed monthly threshold
- C. AWS Trusted Advisor's weekly cost checks
- D. CloudTrail Insights events on the management account

<details><summary>Answer</summary>

**A.** Cost Anomaly Detection uses machine learning to learn normal spending patterns and alerts on unusual spikes, such as a sudden jump in EC2 spend in one Region, without fixed thresholds.

```diagram
Spend history -> *Cost Anomaly Detection | ML baseline -(unusual spike)-> Alert subscription | email or SNS
```

Why not the others:
- **B.** A fixed threshold either misses unusual spending that stays under it or fires constantly when spending naturally varies.
- **C.** Trusted Advisor flags idle or underused resources. It doesn't learn spending patterns or alert on anomalies.
- **D.** CloudTrail Insights detects unusual API activity, not unusual spending.

Resource: <https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html>
</details>

**47.** A finance analyst needs to see how the company's AWS spending has changed over the past 12 months, broken down by service and by the `team` cost allocation tag, and to filter the results to a single linked account, in order to prepare a quarterly review. Which tool should the analyst use?
- A. AWS Budgets, with a budget for each team
- B. AWS Trusted Advisor cost optimization checks
- C. AWS Compute Optimizer rightsizing recommendations
- D. AWS Cost Explorer, grouped by service and tag

<details><summary>Answer</summary>

**D.** Cost Explorer lets you view and analyze historical cost and usage, grouping and filtering by service, linked account, tag and other dimensions, and it can also forecast future spending.

```diagram
Analyst -> *Cost Explorer | 12 months -> Group by service & Group by team tag & Filter: one linked account
```

Why not the others:
- **A.** Budgets track spending against limits you set and alert you. They aren't a tool for analyzing 12 months of history.
- **B.** Trusted Advisor flags specific savings opportunities. It doesn't show spending history by service or tag.
- **C.** Compute Optimizer recommends resource sizes. It doesn't analyze spending history.

Resource: <https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html>
</details>

**48.** A company runs a large fleet of M-family EC2 instances in `eu-west-1`. It's certain the fleet will stay on the M family in that Region for at least three years, although instance sizes and operating systems may change. It wants the biggest Savings Plans discount available for that commitment. What should it buy?
- A. Compute Savings Plans with a three-year term
- B. EC2 Instance Savings Plans for three years
- C. Spot Instances for the entire fleet
- D. On-Demand Capacity Reservations

<details><summary>Answer</summary>

**B.** EC2 Instance Savings Plans commit to one instance family in one Region, but still apply across sizes, operating systems and tenancy within it, and they offer the largest Savings Plans discount (up to 72% off On-Demand).

```diagram
*EC2 Instance Savings Plan | M family, eu-west-1, 3 years -> m6i.large & m7i.xlarge & Linux or Windows
```

Why not the others:
- **A.** Compute Savings Plans are more flexible, but their maximum discount (up to 66%) is lower, and that flexibility isn't needed here.
- **C.** Spot Instances can be interrupted, which doesn't suit a long-term production fleet, and they aren't a commitment discount.
- **D.** Capacity Reservations guarantee capacity at On-Demand prices. They don't provide a discount.

Resource: <https://docs.aws.amazon.com/savingsplans/latest/userguide/plan-types.html>
</details>

**49.** A video-rendering company runs thousands of interruption-tolerant jobs on an EC2 Fleet of Spot Instances across many instance types. It wants to keep costs low while also reducing how often instances get interrupted, rather than always grabbing the absolute cheapest capacity pool. Which allocation strategy should the fleet use?
- A. `lowest-price`, using only the single cheapest pool
- B. `diversified`, spreading evenly across every pool
- C. `price-capacity-optimized` across the instance pools
- D. `capacity-optimized-prioritized`, in a fixed order

<details><summary>Answer</summary>

**C.** The `price-capacity-optimized` strategy chooses Spot pools with the most available capacity and then the lowest price among them, balancing cost against interruptions. AWS recommends it for most Spot workloads.

```diagram
EC2 Fleet -> *price-capacity-optimized -(deepest capacity, then lowest price)-> Spot pool A & Spot pool B & Spot pool C
```

Why not the others:
- **A.** Choosing the cheapest pool alone ignores available capacity, so interruptions tend to be more frequent.
- **B.** Spreading evenly across every pool doesn't favor pools with spare capacity or low prices.
- **D.** A fixed priority order suits workloads that prefer particular instance types. It doesn't optimize for price.

Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-fleet-allocation-strategy.html>
</details>

**50.** An analytics company runs hundreds of containerized data-processing tasks every night on Amazon ECS with AWS Fargate. The tasks checkpoint their progress and can be restarted if stopped, and the team doesn't want to start managing EC2 instances. How can it lower the compute cost of these tasks?
- A. Run the tasks on the Fargate Spot capacity provider
- B. Move the tasks to ECS on EC2 On-Demand Instances
- C. Increase each task's CPU and memory so they finish faster
- D. Buy EC2 Instance Savings Plans for the Fargate tasks

<details><summary>Answer</summary>

**A.** Fargate Spot runs interruption-tolerant ECS tasks on spare capacity at a discount compared with regular Fargate pricing. Tasks get a two-minute warning before they're stopped, which checkpointing handles.

```diagram
Nightly ECS tasks -> *Fargate Spot capacity provider | discounted -(2-minute warning)-> Task checkpoints -> Restarted task
```

Why not the others:
- **B.** Moving to EC2 means managing instances, which the team wants to avoid, and On-Demand pricing gives no discount.
- **C.** Larger tasks cost more per hour, and finishing sooner doesn't usually offset that.
- **D.** EC2 Instance Savings Plans apply only to EC2 instances, not Fargate. Compute Savings Plans would cover Fargate.

Resource: <https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html>
</details>

**51.** A company runs about 300 Lambda functions written in Python and Node.js, with no native x86-specific dependencies. Lambda is now one of its larger costs, and the team wants a low-effort way to get better price-performance without rewriting the functions. What should they change?
- A. Raise every function's memory to the maximum
- B. Add provisioned concurrency to every function
- C. Move the functions to EC2 instances
- D. Switch the functions to the `arm64` architecture

<details><summary>Answer</summary>

**D.** Lambda functions on the `arm64` architecture, which runs on AWS Graviton processors, can get significantly better price-performance than on `x86_64`, and interpreted languages without native x86 dependencies usually need no code changes.

```diagram
Python / Node.js function -(change architecture setting)-> *arm64 on Graviton -> Better price-performance
```

Why not the others:
- **A.** More memory raises the price per millisecond, and many functions won't run fast enough to offset that.
- **B.** Provisioned concurrency reduces cold starts but adds a charge for keeping environments ready.
- **C.** Moving to EC2 means rewriting deployment and managing servers, and paying for idle time.

Resource: <https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html>
</details>

**52.** A startup gives each engineer a sandbox account with a $200 monthly budget. When an account's actual spending reaches 100% of its budget, the company wants AWS to automatically stop that account's EC2 instances and apply a policy that blocks new resources from being launched, not just send an email. What should it use?
- A. Cost Anomaly Detection alerts sent to each engineer
- B. AWS Budgets with budget actions on each account
- C. Trusted Advisor checks for idle resources
- D. A Cost Explorer report saved for each account

<details><summary>Answer</summary>

**B.** Budget actions can run automatically, or after approval, when a threshold is reached. They can apply an IAM policy or SCP and stop specific EC2 or RDS instances.

```diagram
Sandbox account spend -(100% of $200 budget)-> *Budget action -> Stop EC2 instances & Apply SCP or IAM policy | block launches
```

Why not the others:
- **A.** Anomaly alerts notify people about unusual spending. They don't take action.
- **C.** Trusted Advisor flags idle resources, but it doesn't enforce a budget or stop instances.
- **D.** A saved report shows spending. It doesn't alert on thresholds or take action.

Resource: <https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-controls.html>
</details>

---

## Task 4.3: Design cost-optimized database solutions

**23.** A DynamoDB table backing a well-established internal tool has predictable, steady traffic that barely changes week to week. Which capacity mode is usually cheaper for this table?
- A. Provisioned capacity with auto scaling
- B. Global tables with on-demand capacity
- C. On-demand capacity
- D. Provisioned capacity fixed at twice the average load

<details><summary>Answer</summary>

**A.** For predictable, steady traffic, provisioned capacity (with auto scaling to absorb small variations, and reserved capacity for further savings) is usually cheaper than on-demand, which is priced for unknown or spiky traffic.

```diagram
Steady traffic -> *Provisioned capacity | auto scaling for small swings -> Lower cost than on-demand mode
```

Why not the others:
- **B.** Global tables add replica Regions, which adds cost, and on-demand is priced for unpredictable traffic.
- **C.** On-demand is priced for unknown or spiky traffic and usually costs more for steady, predictable load.
- **D.** Provisioning twice the average load pays for capacity that's never used.

Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html>
</details>

**24.** A DynamoDB table holds years of historical order records that are rarely read but must stay queryable, and storage cost for the table — not throughput — has become the dominant line item. Which option lowers storage cost?
- A. DynamoDB Accelerator (DAX) in front of the table
- B. The DynamoDB Standard-Infrequent Access table class
- C. Global tables with a replica in a lower-cost Region
- D. More read capacity units provisioned on the table

<details><summary>Answer</summary>

**B.** The Standard-IA table class lowers per-GB storage price in exchange for a somewhat higher per-request cost, which is the right trade-off for large amounts of rarely read data. (For data that's rarely needed at all, TTL plus export to S3 is another option.)

```diagram
Rarely read history -> *Standard-IA table class | cheaper storage, pricier requests -> Still queryable
```

Why not the others:
- **A.** DAX caches reads and adds its own cost. It doesn't reduce storage cost.
- **C.** A replica in another Region stores the data a second time, which adds storage cost.
- **D.** More read capacity increases throughput cost and doesn't reduce storage cost.

Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.TableClasses.html>
</details>

**25.** Session records in a DynamoDB table should disappear automatically 24 hours after they're written, and the team specifically wants this cleanup to consume no write capacity and cost nothing extra. What should be used?
- A. A Lambda cron job that deletes items
- B. DynamoDB Streams
- C. Time to Live (TTL)
- D. Point-in-time recovery

<details><summary>Answer</summary>

**C.** TTL deletes expired items in the background at no additional cost and without consuming write capacity, unlike a Lambda job that would call `DeleteItem` and consume write capacity for every deletion. (Deletion isn't instant: DynamoDB typically removes expired items within a few days, so queries should filter out expired items.)

```diagram
Session item | expiresAt = now + 24 h -> *TTL | background deletion, free -> Item removed | no write capacity used
```

Why not the others:
- **A.** A Lambda job calls `DeleteItem` for each record, which consumes write capacity and adds Lambda cost.
- **B.** Streams record item changes. They don't delete anything.
- **D.** Point-in-time recovery adds backup cost and doesn't delete items.

Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html>
</details>

**26.** A production RDS database is expected to run 24/7 at a stable size for the next three years, based on a signed multi-year contract with the business unit it supports. How should cost be minimized?
- A. Run the database on Spot Instances through Amazon RDS
- B. Move it to RDS Custom so that Spot pricing applies
- C. Keep it On-Demand and scale the instance down at night
- D. Buy RDS Reserved Instances or a Database Savings Plan

<details><summary>Answer</summary>

**D.** For a stable, long-term commitment, RDS Reserved Instances or a Database Savings Plan give a substantial discount over On-Demand. Spot pricing isn't available for RDS in any form.

```diagram
*RDS Reserved Instance or Database Savings Plan | 3-year term -> Production RDS | 24/7, stable size
```

Why not the others:
- **A.** Amazon RDS doesn't offer Spot pricing.
- **B.** RDS Custom doesn't offer Spot pricing either.
- **C.** The database has to run 24/7 at a stable size, so scaling it down at night isn't an option, and On-Demand is full price.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithReservedDBInstances.html>
</details>

**27.** A development RDS database is used only about 8 hours a day, Monday through Friday, by a small team in one time zone. What is a simple cost saving?
- A. Stop the instance when it isn't in use
- B. Increase allocated storage to raise baseline IOPS
- C. Enable Multi-AZ to spread the cost across AZs
- D. Add read replicas and shrink the primary instance

<details><summary>Answer</summary>

**A.** Stopping the instance outside business hours avoids paying for compute during the roughly two-thirds of the week it sits idle. (A stopped RDS instance restarts automatically after 7 days; Aurora Serverless v2, which can scale down to 0 ACUs, is another option for this pattern.)

```diagram
Weekdays 9-5 -> RDS instance | running
Evenings and weekends -> *RDS instance stopped | pay storage only -(auto-restarts after 7 days)-> Restart / stop again
```

Why not the others:
- **B.** More allocated storage increases cost. It doesn't reduce it.
- **C.** Multi-AZ adds a standby instance, which roughly doubles the instance cost.
- **D.** Read replicas are additional instances that add cost.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_StopInstance.html>
</details>

**28.** A company is migrating off Oracle on-premises specifically to escape its licensing costs, and is willing to change database engines entirely rather than just move Oracle as-is. Which tools help with this kind of migration?
- A. AWS Snowball Edge to ship the Oracle database files to Amazon S3
- B. AWS SCT (or DMS Schema Conversion) with AWS DMS, targeting Aurora PostgreSQL
- C. AWS Application Migration Service to rehost the Oracle servers on EC2
- D. AWS DataSync to copy the Oracle data files into Amazon RDS for Oracle

<details><summary>Answer</summary>

**B.** This is a heterogeneous migration (different source and target engines). The Schema Conversion Tool converts the Oracle schema and code to Aurora PostgreSQL, and DMS migrates and can continuously replicate the data.

```diagram
Oracle on premises -(schema and code)-> *AWS SCT or DMS Schema Conversion -> Aurora PostgreSQL
Oracle on premises -(data + ongoing changes)-> *AWS DMS -> Aurora PostgreSQL
```

Why not the others:
- **A.** Snowball ships data physically. It doesn't convert Oracle to another engine, so the licensing costs remain.
- **C.** Rehosting Oracle on EC2 keeps the Oracle licenses the company wants to drop.
- **D.** RDS for Oracle keeps Oracle licensing, and DataSync copies files rather than migrating databases.

Resource: <https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html>
</details>

**29.** Read-heavy traffic keeps forcing the team to scale up an already-expensive RDS instance class every few months, and finance has started asking pointed questions about the trend. What is often cheaper than continuing to scale up?
- A. Move to a larger instance class with more memory
- B. Cache hot data in ElastiCache, or add read replicas
- C. Enable Multi-AZ so the standby serves the reads
- D. Switch the storage to Provisioned IOPS (io2) volumes

<details><summary>Answer</summary>

**B.** Offloading hot reads to ElastiCache or spreading them across read replicas addresses the actual read-heavy bottleneck directly, often far more cheaply than repeatedly scaling up the primary instance class.

```diagram
App -(hot reads)-> *ElastiCache -(misses only)-> RDS primary
App -(other reads)-> *Read replicas -> Smaller primary instance
```

Why not the others:
- **A.** Moving to a larger instance class is the expensive pattern finance is already questioning.
- **C.** A standard Multi-AZ standby doesn't serve reads, so it adds cost without offloading traffic.
- **D.** Faster storage costs more and doesn't reduce the number of reads hitting the instance.

Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html>
</details>

**30.** A team keeps manually bumping up allocated storage on an RDS instance every time free space runs low, usually over-provisioning "just in case" to avoid doing it again soon. Which RDS storage feature would handle this automatically instead?
- A. RDS Proxy connection pooling
- B. RDS storage autoscaling
- C. Performance Insights
- D. Aurora Backtrack

<details><summary>Answer</summary>

**B.** RDS storage autoscaling increases allocated storage automatically when free space runs low, removing the need to over-provision "just in case." (Aurora's storage grows automatically by design and doesn't need this feature.)

```diagram
Free space runs low -> *RDS storage autoscaling -> Allocated storage grows automatically
```

Why not the others:
- **A.** RDS Proxy pools database connections. It doesn't manage storage.
- **C.** Performance Insights helps diagnose database performance. It doesn't change storage.
- **D.** Backtrack rewinds an Aurora database to an earlier point in time. It doesn't manage storage.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIOPS.Autoscaling.html>
</details>

**31.** An I/O-heavy Aurora workload's monthly bill shows I/O charges running above 25% of the total Aurora cost, and that share keeps growing as traffic increases. Which configuration can lower the total cost?
- A. Aurora Standard
- B. Aurora Backtrack
- C. Aurora I/O-Optimized
- D. RDS for MySQL with gp3 storage

<details><summary>Answer</summary>

**C.** Aurora I/O-Optimized removes per-I/O charges in exchange for a higher instance and storage price, which becomes cheaper overall once I/O costs pass roughly 25% of the Aurora bill.

```diagram
Aurora Standard | instances + storage + per-I/O charges -(I/O over 25% of bill)-> *Aurora I/O-Optimized | no per-I/O charges
```

Why not the others:
- **A.** Aurora Standard is the pay-per-I/O configuration that's causing the growing I/O charges.
- **B.** Backtrack rewinds the database to an earlier point and adds its own cost. It doesn't reduce I/O charges.
- **D.** Moving to RDS for MySQL is a migration off Aurora, not a configuration change, and gives up Aurora's storage architecture.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html#aurora-storage-type>
</details>

**32.** A company runs infrequent, ad hoc analytics — maybe a few queries a week — over years of S3 log data, but keeps an always-on Redshift cluster running just in case someone needs to run a query. What is cheaper?
- A. Query the data in place in S3 with Amazon Athena
- B. Import the logs into DynamoDB and run a scan for each analysis
- C. Resize the cluster to larger RA3 nodes so queries finish sooner
- D. Load the logs into Amazon RDS for PostgreSQL and query them there

<details><summary>Answer</summary>

**A.** Athena runs pay-per-query SQL directly against the S3 data with nothing to keep running between queries, avoiding the cost of an always-on cluster for infrequent access. (Redshift Spectrum or Redshift Serverless are other ways to avoid paying for idle cluster time.)

```diagram
Analyst | a few queries a week -(pay per query)-> *Amazon Athena -> S3 log data
Always-on Redshift cluster -x(idle most of the time)-> Removed
```

Why not the others:
- **B.** DynamoDB isn't built for ad hoc SQL analytics, and full table scans are slow and expensive.
- **C.** Larger nodes cost more, and the cluster still runs all the time.
- **D.** RDS means importing the data and running a database all the time for a few queries a week.

Resource: <https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-serverless.html>
</details>

**53.** A DynamoDB table in provisioned capacity mode, using the Standard table class, serves a steady 20,000 reads and 5,000 writes per second around the clock, and the company expects that to continue for at least three years. How can the cost of this throughput be reduced MOST?
- A. Switch the table to on-demand capacity mode
- B. Change the table to the Standard-IA table class
- C. Buy DynamoDB reserved capacity for the baseline
- D. Add a DAX cluster to handle all of the writes

<details><summary>Answer</summary>

**C.** Reserved capacity gives discounted pricing for a committed amount of provisioned read and write capacity on Standard table class tables, which suits steady, long-term throughput.

```diagram
Steady 20,000 reads + 5,000 writes per second -> *Reserved capacity | 1 or 3 years -> Provisioned table | Standard class
```

Why not the others:
- **A.** On-demand pricing is designed for unpredictable traffic and usually costs more for steady load.
- **B.** Standard-IA lowers storage costs but raises throughput prices, which is the opposite of what a busy table needs.
- **D.** DAX caches reads. It doesn't handle writes, and it adds its own cost.

Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/reserved-capacity.html>
</details>

**54.** A team has a dozen Aurora PostgreSQL development databases that are used for a few hours on some weekdays and sit completely idle the rest of the time, including every weekend. They want to stop paying for compute while a database is idle, without scripts that stop and start clusters. What should they use?
- A. Aurora Serverless v2 that scales to 0 ACUs
- B. Provisioned Aurora with Reserved Instances
- C. Aurora I/O-Optimized on smaller instances
- D. A read replica for each development database

<details><summary>Answer</summary>

**A.** Aurora Serverless v2 can scale down to 0 ACUs and pause automatically after a period of no connections, so idle databases don't incur compute charges, and they resume when a connection arrives.

```diagram
No connections -> *Aurora Serverless v2 | scales to 0 ACUs, pauses -> No compute charge
New connection -> *Aurora Serverless v2 | scales to 0 ACUs, pauses -> Resumes automatically
```

Why not the others:
- **B.** Reserved Instances discount instances that run all the time, but these databases sit idle most of the week.
- **C.** I/O-Optimized reduces I/O charges for busy databases. Instances still cost money while idle.
- **D.** Read replicas are extra instances that add cost.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-auto-pause.html>
</details>

**55.** A marketing analytics team runs a few heavy SQL reports on its data warehouse at the start of each month, and almost nothing the rest of the time. Today it pays for a provisioned Redshift cluster that runs 24/7. The team wants to keep using Redshift SQL and its existing BI tools while paying only when queries run. What should they move to?
- A. A larger provisioned cluster with Reserved Nodes
- B. Amazon RDS for PostgreSQL, run on demand
- C. Amazon DynamoDB with on-demand capacity
- D. Amazon Redshift Serverless

<details><summary>Answer</summary>

**D.** Redshift Serverless provisions and scales data warehouse capacity automatically, and you pay only for the capacity used while queries run, with no charge for idle compute. Existing SQL and BI tools keep working.

```diagram
Monthly reports | existing BI tools -> *Redshift Serverless | pay while queries run -> Data
Rest of the month -> *Redshift Serverless | pay while queries run -> No compute charge
```

Why not the others:
- **A.** Reserved Nodes discount a cluster that runs all the time, but the team still pays for it while idle.
- **B.** RDS is a transactional database, not a data warehouse, and moving would mean migrating data and queries.
- **C.** DynamoDB is a key-value database. It can't run the team's SQL reports or BI tools.

Resource: <https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-serverless.html>
</details>

**56.** A company runs steady workloads on Aurora, RDS, DynamoDB and ElastiCache, and expects to move some workloads between these services over the next year as part of a modernization project. It wants one commitment-based discount that keeps applying as usage shifts between database services. What should it buy?
- A. RDS Reserved Instances for every current database
- B. A Database Savings Plan
- C. Compute Savings Plans
- D. EC2 Instance Savings Plans

<details><summary>Answer</summary>

**B.** Database Savings Plans reduce costs by up to 35% across services including Aurora, RDS, DynamoDB and ElastiCache, and keep applying when a workload moves between them, for example from RDS to DynamoDB.

```diagram
*Database Savings Plan | one commitment -> Aurora & RDS & DynamoDB & ElastiCache
Workload moves from RDS -> DynamoDB | discount still applies
```

Why not the others:
- **A.** Reserved Instances are tied to specific RDS instances, so they stop helping when workloads move to other services.
- **C.** Compute Savings Plans cover EC2, Fargate and Lambda, not database services.
- **D.** EC2 Instance Savings Plans cover one EC2 instance family, not database services.

Resource: <https://docs.aws.amazon.com/savingsplans/latest/userguide/plan-types.html>
</details>

**57.** An RDS for MySQL database was set up years ago on Provisioned IOPS (io1) storage with 3,000 provisioned IOPS, and monitoring shows it rarely goes above 2,000 IOPS. The storage bill is higher than the team expected. Which change lowers storage cost while still meeting the workload's needs?
- A. Raise the provisioned IOPS to 10,000
- B. Switch to magnetic (standard) storage
- C. Switch the storage to gp3
- D. Enable Multi-AZ for the database

<details><summary>Answer</summary>

**C.** gp3 storage on RDS includes a baseline of 3,000 IOPS in its storage price, which covers this workload, so moving off io1 removes the separate charge for provisioned IOPS.

```diagram
RDS for MySQL | peaks at 2,000 IOPS -(change storage)-> *gp3 | 3,000 IOPS included -x(no longer paid)-> io1 provisioned IOPS charge
```

Why not the others:
- **A.** Provisioning more IOPS raises the cost, and the workload doesn't need them.
- **B.** Magnetic storage is a previous-generation option with low, unpredictable performance, and AWS doesn't recommend it for new use.
- **D.** Multi-AZ adds a standby with its own storage, roughly doubling the cost.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Storage.html>
</details>

---

## Task 4.4: Design cost-optimized network architectures

**33.** Private EC2 instances send large volumes of data to S3 through a NAT gateway every day, and NAT gateway data-processing charges have become one of the largest line items on the VPC's bill. What is the MOST cost-effective fix?
- A. Add an S3 gateway VPC endpoint
- B. Use Transfer Acceleration
- C. Add a second NAT gateway
- D. Use an internet gateway for private subnets

<details><summary>Answer</summary>

**A.** An S3 gateway VPC endpoint routes traffic to S3 without going through the NAT gateway at all, and it's free to use, eliminating the NAT data-processing charge for that traffic.

```diagram
[Private subnet: EC2] -(route to S3 prefix list)-> *S3 gateway endpoint | free -> Amazon S3
[Private subnet: EC2] ~(no longer used)~> NAT gateway | per-GB charge
```

Why not the others:
- **B.** Transfer Acceleration adds charges and doesn't take the traffic off the NAT gateway.
- **C.** A second NAT gateway adds hourly charges, and the data-processing charges stay the same.
- **D.** Routing private subnets to an internet gateway requires public IPs, which exposes the instances and makes the subnets public.

Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html>
</details>

**34.** A billing analyst reviewing a confusing invoice wants to know which of these data-transfer types is generally FREE.
- A. Cross-Region data transfer
- B. Cross-AZ data transfer between EC2 instances
- C. Data transfer from EC2 to the internet
- D. Inbound data transfer from the internet into AWS

<details><summary>Answer</summary>

**D.** Inbound data transfer from the internet is generally free. Cross-AZ traffic is charged in each direction, and outbound-to-the-internet and cross-Region transfer both carry data-transfer-out charges. (Traffic within the same AZ over private IP addresses is also free.)

```diagram
Internet -(inbound)-> *Free | data transfer in -> AWS
AWS -(outbound to internet: charged)-> Internet
AZ a -(cross-AZ: charged each way)-> AZ b
```

Why not the others:
- **A.** Data transferred between Regions is charged.
- **B.** Data transferred between AZs is charged in each direction.
- **C.** Data transferred from EC2 to the internet is charged.

Resource: <https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer>
</details>

**35.** A chatty application tier and its ElastiCache cluster are spread across multiple AZs for high availability, and exchange terabytes of data every month — largely between mismatched AZ pairs, simply by chance of which node each client happened to connect to. How can cost be reduced while keeping HA in mind?
- A. Route clients to cache nodes in their own AZ, keeping other AZs for failover
- B. Send the traffic over public IP addresses instead of private addresses
- C. Route the traffic between tiers through a NAT gateway in each AZ
- D. Move every tier into a single AZ and remove the capacity in the other AZs

<details><summary>Answer</summary>

**A.** Cross-AZ traffic is billed in each direction, so preferring same-AZ cache nodes for normal traffic cuts that cost, while the cache nodes in other AZs remain available for failover if the local one becomes unhealthy.

```diagram
[AZ a: App tier -(same AZ: free)-> *Cache node a]
[AZ b: App tier -(same AZ: free)-> *Cache node b]
App tier | AZ a ~(only on failover)~> Cache node b
```

Why not the others:
- **B.** Public IP addresses carry their own hourly charges and don't make data transfer cheaper.
- **C.** A NAT gateway adds data-processing charges on top of the existing transfer cost.
- **D.** A single AZ removes high availability, which the requirement says to keep.

Resource: <https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/plan-for-data-transfer.html>
</details>

**36.** A company serves static product images directly from an S3 bucket to a global audience, and the data-transfer-out line on the bill keeps climbing as international traffic grows. What lowers both cost and latency?
- A. Turn on Requester Pays for public users
- B. Replicate the bucket to every Region
- C. Put CloudFront in front of the bucket
- D. Enable S3 Transfer Acceleration on the bucket

<details><summary>Answer</summary>

**C.** Data transfer from S3 to CloudFront is free, and CloudFront's data-transfer-out pricing is typically cheaper than S3's directly, while also serving cached content from edge locations closer to users.

```diagram
Global users -> *CloudFront edge cache -(origin fetch: free from S3)-> S3 bucket
```

Why not the others:
- **A.** Requester Pays requires every request to be authenticated, so anonymous public users couldn't fetch the images.
- **B.** Replicating to every Region adds storage and replication charges, and users would still download directly from S3.
- **D.** Transfer Acceleration adds charges and mainly speeds up long-distance uploads. It doesn't reduce data transfer out.

Resource: <https://aws.amazon.com/cloudfront/pricing/>
</details>

**37.** A company already has a working Site-to-Site VPN connection and transfers hundreds of TB per month over it between its data center and AWS, and both the cost and occasional throughput variability have become a concern as volume keeps growing. Which option usually lowers data-transfer cost and improves consistency?
- A. AWS Global Accelerator
- B. AWS Direct Connect
- C. A transit gateway in front of the VPN
- D. More VPN tunnels with ECMP

<details><summary>Answer</summary>

**B.** Direct Connect has lower data-transfer-out rates than transferring the same volume over the internet (as a VPN does), plus more consistent, dedicated bandwidth.

```diagram
Data center -(dedicated, consistent bandwidth)-> *Direct Connect | lower transfer-out rate -> AWS
Data center ~(over the internet)~> Site-to-Site VPN -> AWS
```

Why not the others:
- **A.** Global Accelerator speeds up internet users' traffic to AWS endpoints. It doesn't provide a private link from a data center, and it adds cost.
- **C.** A transit gateway adds its own charges, and the VPN still runs over the internet.
- **D.** More tunnels add bandwidth, but the traffic still runs over the internet, with the same pricing and variability.

Resource: <https://aws.amazon.com/directconnect/pricing/pay-as-you-go/>
</details>

**38.** A company has 20 VPCs, and every single one runs and pays for its own pair of NAT gateways, most of which sit mostly idle outside business hours. How can NAT costs be reduced across the fleet?
- A. Centralize egress in a shared egress VPC reached through Transit Gateway
- B. Peer every VPC with one VPC and share that VPC's NAT gateways
- C. Route the private subnets straight to each VPC's internet gateway
- D. Add a second NAT gateway in each VPC to spread the processing load

<details><summary>Answer</summary>

**A.** Centralizing egress through a shared VPC reached over Transit Gateway consolidates NAT gateways down to a much smaller, shared set. (Weigh the Transit Gateway attachment and data-processing charges against the NAT gateway hours actually saved.)

```diagram
VPC 1 & VPC 2 & VPC 20 -> Transit Gateway -> [Shared egress VPC: *Shared NAT gateways] -> Internet
```

Why not the others:
- **B.** VPC peering doesn't allow edge-to-edge routing, so one VPC can't send internet traffic through another VPC's NAT gateway.
- **C.** Routing private subnets to an internet gateway requires public IPs, which exposes the instances.
- **D.** More NAT gateways add hourly cost instead of reducing it.

Resource: <https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/centralized-egress-to-internet.html>
</details>

**39.** During a cost audit, an engineer is surprised to learn that some resources cost money even while sitting completely idle, doing no work at all. Which of these is a real example of that?
- A. Public IPv4 addresses and idle NAT gateways
- B. Security groups with no attached instances
- C. Gateway VPC endpoints with no traffic
- D. Route tables with no associated subnets

<details><summary>Answer</summary>

**A.** AWS charges an hourly rate for all public IPv4 addresses, including unattached Elastic IPs, and NAT gateways are billed hourly whether or not they're processing traffic. The other three are free regardless of use.

```diagram
*Public IPv4 address | hourly, even unattached -> Charges while idle
*NAT gateway | hourly, even with no traffic -> Charges while idle
```

Why not the others:
- **B.** Security groups are free, whether or not anything uses them.
- **C.** Gateway VPC endpoints (for S3 and DynamoDB) are free.
- **D.** Route tables are free.

Resource: <https://aws.amazon.com/vpc/pricing/>
</details>

**40.** A network architect comparing designs wants to correctly state, in a cost-comparison document, how VPC peering charges differ from Transit Gateway charges. Which statement is CORRECT?
- A. Peering charges per attachment-hour and per GB, the same way as Transit Gateway
- B. Transit Gateway has no charges, while peering charges for each connection-hour
- C. Both are free; only data transfer out to the internet is charged for either
- D. Peering bills only data transfer; Transit Gateway bills per attachment-hour and per GB

<details><summary>Answer</summary>

**D.** VPC peering connections themselves have no hourly charge — only the data transferred over them is billed. Transit Gateway, by contrast, charges per attachment-hour plus per GB processed through it.

```diagram
VPC A -> *Peering | no hourly charge, pay per GB transferred -> VPC B
VPC A -> *Transit Gateway | per attachment-hour + per GB processed -> VPC C
```

Why not the others:
- **A.** VPC peering has no attachment-hour charge; only data transfer is billed.
- **B.** Transit Gateway charges per attachment-hour and per GB processed, and peering has no hourly charge.
- **C.** Both bill for data transfer: peering for traffic that crosses AZs or Regions, and Transit Gateway per GB processed.

Resource: <https://aws.amazon.com/transit-gateway/pricing/>
</details>

**58.** A regional news site serves almost all of its readers in North America and Europe through CloudFront. The CloudFront bill includes delivery from edge locations worldwide, and the team is willing to accept slightly higher latency for the rare readers elsewhere in exchange for lower cost. What should they change?
- A. Choose a lower-cost CloudFront price class
- B. Replace CloudFront with Global Accelerator
- C. Serve the site directly from the S3 bucket
- D. Enable Transfer Acceleration on the origin

<details><summary>Answer</summary>

**A.** A price class limits CloudFront to edge locations in lower-cost regions, such as North America and Europe. Readers elsewhere are still served, from those edge locations, with somewhat higher latency.

```diagram
Readers in North America and Europe -> *CloudFront price class | lower-cost edge locations only -> Origin
Rare readers elsewhere -(slightly higher latency)-> *CloudFront price class | lower-cost edge locations only
```

Why not the others:
- **B.** Global Accelerator doesn't cache content, and it adds its own charges.
- **C.** Serving directly from S3 loses caching and usually costs more in data transfer.
- **D.** Transfer Acceleration speeds up transfers to S3, and it adds charges rather than reducing them.

Resource: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesGeneral.html>
</details>

**59.** A cost review shows a growing charge for public IPv4 addresses across hundreds of EC2 instances and load balancers. Most of these instances only need outbound internet access or are reached through a load balancer, and the company's clients and networks already support IPv6. Which change reduces this charge?
- A. Replace public IPv4 addresses with Elastic IPs
- B. Add a second NAT gateway in each Availability Zone
- C. Give every instance its own public IPv4 address
- D. Use IPv6, and remove public IPv4 where not needed

<details><summary>Answer</summary>

**D.** AWS charges for every public IPv4 address, including Elastic IPs, but not for IPv6 addresses. Moving to IPv6 (for example, dual-stack or IPv6-only subnets, with an egress-only internet gateway for outbound traffic) and removing unneeded public IPv4 addresses reduces the charge.

```diagram
Client | IPv6 -> ALB | dual-stack -> [IPv6 subnet: EC2 | no public IPv4] -(outbound)-> *Egress-only internet gateway -> Internet
```

Why not the others:
- **A.** Elastic IPs are public IPv4 addresses too, and they're charged the same way.
- **B.** NAT gateways add hourly and data-processing charges, and each one uses its own public IPv4 address.
- **C.** More public IPv4 addresses increase the charge.

Resource: <https://aws.amazon.com/vpc/pricing/>
</details>

**60.** A fleet of EC2 instances in private subnets makes billions of DynamoDB requests a month, and all of that traffic goes out through a NAT gateway. The NAT gateway's data-processing charges are now larger than the DynamoDB bill itself. What is the MOST cost-effective fix?
- A. An interface VPC endpoint for DynamoDB
- B. A gateway VPC endpoint for DynamoDB
- C. A second NAT gateway in each Availability Zone
- D. DynamoDB Accelerator (DAX) in front of the table

<details><summary>Answer</summary>

**B.** A gateway endpoint for DynamoDB adds a route so traffic reaches DynamoDB without passing through the NAT gateway, and gateway endpoints have no charge.

```diagram
[Private subnet: EC2] -(route to DynamoDB prefix list)-> *DynamoDB gateway endpoint | free -> DynamoDB
[Private subnet: EC2] ~(bypassed)~> NAT gateway | per-GB charge
```

Why not the others:
- **A.** An interface endpoint also avoids the NAT gateway, but it's billed per hour and per GB, while a gateway endpoint is free.
- **C.** More NAT gateways add hourly charges, and the data-processing charges stay the same.
- **D.** DAX could reduce some reads, but it adds its own cost, and writes and uncached reads would still go through the NAT gateway.

Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-ddb.html>
</details>
