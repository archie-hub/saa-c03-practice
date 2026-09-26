# Domain 3: Design High-Performing Architectures (24%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain3.html>

---

## Task 3.1: Determine high-performing and/or scalable storage solutions

**1.** A database on EC2 needs 150,000 IOPS with consistent sub-millisecond latency on a single volume. Which EBS volume type fits?
- A. gp2 (General Purpose SSD) at 16 TiB
- B. gp3 (General Purpose SSD) at maximum IOPS
- C. io2 Block Express (Provisioned IOPS SSD)
- D. st1 (Throughput Optimized HDD)

<details><summary>Answer</summary>

**C.** io2 Block Express supports up to 256,000 IOPS with sub-millisecond latency. gp3 tops out at 80,000 IOPS per volume, and HDD volumes are built for throughput, not IOPS.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html>
</details>

**2.** Which EBS volume type lets you provision IOPS and throughput separately from capacity, at a lower cost than gp2?
- A. io1
- B. Magnetic (standard)
- C. st1
- D. gp3

<details><summary>Answer</summary>

**D.** gp3 has a baseline of 3,000 IOPS and 125 MiB/s, and both can be raised independently of volume size.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/general-purpose.html>
</details>

**3.** A big data job frequently reads large files sequentially and needs high throughput at low cost. Which EBS type fits?
- A. gp3 (General Purpose SSD)
- B. io2 (Provisioned IOPS SSD)
- C. sc1 (Cold HDD) as the boot volume
- D. st1 (Throughput Optimized HDD)

<details><summary>Answer</summary>

**D.** HDD volumes (st1 and sc1) can't be boot volumes.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/hdd-vols.html>
</details>

**4.** An application needs very high random I/O temporary scratch space. Data can be lost when the instance stops. Which option is BEST?
- A. Amazon S3 Express One Zone
- B. EC2 instance store (NVMe)
- C. Amazon EFS in Max I/O mode
- D. An io2 EBS volume

<details><summary>Answer</summary>

**B.** Instance store is ephemeral, physically attached storage.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html>
</details>

**5.** An HPC workload needs a parallel file system with hundreds of GB/s of throughput, linked to an S3 data lake. What should be used?
- A. S3 Glacier Instant Retrieval mounted with Mountpoint
- B. Amazon FSx for Windows File Server with SSD storage
- C. Amazon EFS with Elastic Throughput and Max I/O mode
- D. Amazon FSx for Lustre linked to an S3 data repository

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/fsx/latest/LustreGuide/what-is.html>
</details>

**6.** Windows applications need a shared SMB file system integrated with Active Directory and supporting DFS. What should be used?
- A. Amazon FSx for Lustre
- B. Amazon FSx for Windows File Server
- C. Amazon EFS with Elastic Throughput
- D. An S3 bucket mounted through s3fs

<details><summary>Answer</summary>

**B.** EFS supports NFS only (Linux).
Resource: <https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html>
</details>

**7.** A company is moving NetApp ONTAP workloads and needs NFS, SMB, and iSCSI multi-protocol access with SnapMirror. What fits?
- A. Amazon FSx for NetApp ONTAP
- B. Amazon EFS with cross-Region replication
- C. Amazon FSx for OpenZFS
- D. AWS Storage Gateway Tape Gateway

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/fsx/latest/ONTAPGuide/what-is-fsx-ontap.html>
</details>

**8.** Users around the world upload large files (multiple GB) to one S3 bucket in us-east-1, and uploads are slow. Which TWO features improve performance? (Select TWO.)
- A. S3 Glacier Deep Archive
- B. Multipart upload
- C. S3 Transfer Acceleration
- D. Requester Pays
- E. S3 Object Lock

<details><summary>Answer</summary>

**B, C.** Multipart upload is recommended for objects over 100 MB and required for objects over 5 GB.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html>
</details>

**9.** How can an application get more than 5,500 GET requests per second from S3?
- A. Move the objects to S3 One Zone-IA, which has higher request limits
- B. Nothing; S3 is limited to 5,500 GET requests per second for each bucket
- C. Enable versioning so that reads are spread across object versions
- D. Spread objects across multiple prefixes, since request limits apply per prefix

<details><summary>Answer</summary>

**D.** Each prefix supports 5,500 GET/HEAD and 3,500 PUT/POST/DELETE requests per second, and there's no limit on the number of prefixes.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html>
</details>

**10.** An ML training job needs single-digit-millisecond access to frequently read S3 data in one AZ, with the highest request rates. Which storage class fits?
- A. S3 Glacier Instant Retrieval
- B. S3 Intelligent-Tiering
- C. S3 Express One Zone
- D. S3 Standard-IA

<details><summary>Answer</summary>

**C.** It uses directory buckets and is co-located with compute.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/directory-bucket-high-performance.html>
</details>

**11.** An on-premises application needs low-latency local access to frequently used files while storing all data durably in S3 as objects. What should be used?
- A. AWS Transfer Family SFTP server
- B. AWS DataSync with an on-premises agent
- C. Volume Gateway stored mode backed by EBS
- D. AWS Storage Gateway, S3 File Gateway

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/filegateway/latest/files3/what-is-file-s3.html>
</details>

---

## Task 3.2: Design high-performing and elastic compute solutions

**12.** HPC nodes need the lowest latency and the highest packets per second between them. Which placement group should be used?
- A. Spread placement group
- B. Cluster placement group
- C. Partition placement group
- D. No placement group

<details><summary>Answer</summary>

**B.** A cluster placement group puts instances close together in a single AZ. Add Elastic Fabric Adapter (EFA) for MPI workloads.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-strategies.html>
</details>

**13.** A small number of critical instances must each run on distinct hardware to reduce correlated failures. Which placement group fits?
- A. Dedicated Host
- B. Spread
- C. Cluster
- D. Partition

<details><summary>Answer</summary>

**B.** A spread placement group allows up to 7 running instances per AZ.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-strategies.html>
</details>

**14.** A large Hadoop, Cassandra, or Kafka cluster needs rack-aware placement across groups of instances. Which placement group should be used?
- A. Partition placement group
- B. Cluster placement group
- C. No placement group
- D. Spread placement group

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-strategies.html>
</details>

**15.** An in-memory analytics application needs a high memory-to-vCPU ratio. Which instance family should be chosen?
- A. Burstable (T)
- B. Compute optimized (C)
- C. Memory optimized (R, X)
- D. Storage optimized (I, D)

<details><summary>Answer</summary>

**C.**
Resource: <https://aws.amazon.com/ec2/instance-types/>
</details>

**16.** A Lambda function is CPU-bound and runs slowly. How is more CPU allocated?
- A. Enable provisioned concurrency so that more CPU is reserved
- B. Increase the memory setting, because CPU scales in proportion to memory
- C. Increase the function timeout so that it has more time to run
- D. Set the number of vCPUs in the function's configuration

<details><summary>Answer</summary>

**B.** Memory can be set up to 10,240 MB, which gives up to 6 vCPUs.
Resource: <https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html>
</details>

**17.** A latency-sensitive Lambda API suffers from cold starts during business hours. What reduces them?
- A. Provisioned concurrency (or SnapStart for supported runtimes)
- B. A longer timeout on the function and on the API integration
- C. A dead-letter queue that catches failed invocations
- D. Reserved concurrency set to the peak number of requests

<details><summary>Answer</summary>

**A.** Reserved concurrency limits or guarantees the number of concurrent executions but doesn't pre-initialize execution environments.
Resource: <https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html>
</details>

**18.** A job runs for 3 hours per batch item. Why is Lambda NOT suitable?
- A. The maximum Lambda timeout is 15 minutes
- B. Lambda doesn't support the Python runtime
- C. Lambda functions can't read from or write to S3
- D. Lambda functions can't use IAM execution roles

<details><summary>Answer</summary>

**A.** Use AWS Batch, ECS or Fargate tasks, or EC2 instead.
Resource: <https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html>
</details>

**19.** A company needs to run thousands of containerized batch jobs with job queues, dependencies, and automatic provisioning of optimal compute, including Spot. What should it use?
- A. AWS Batch
- B. AWS Step Functions alone
- C. EC2 Image Builder
- D. Amazon Lightsail

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/batch/latest/userguide/what-is-batch.html>
</details>

**20.** A development team wants to deploy a web application by uploading code, with AWS handling capacity provisioning, load balancing, and scaling, while the team keeps access to the underlying resources. What should it use?
- A. AWS Elastic Beanstalk
- B. Amazon EC2 manually
- C. AWS CloudFormation only
- D. AWS Outposts

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html>
</details>

**21.** An ALB must route `/api/*` to one target group and `/images/*` to another. Which ALB feature does this?
- A. Sticky sessions on each target group
- B. Cross-zone load balancing
- C. Path-based routing in listener rules
- D. Connection draining (deregistration delay)

<details><summary>Answer</summary>

**C.** ALBs also support host-based, header-based, and query-string routing.
Resource: <https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html>
</details>

**22.** An application needs a load balancer that handles millions of requests per second, with static IP addresses per AZ, for TCP/UDP traffic. Which should be used?
- A. Application Load Balancer
- B. Classic Load Balancer
- C. Gateway Load Balancer
- D. Network Load Balancer

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html>
</details>

**23.** Traffic must pass transparently through a fleet of third-party virtual firewall appliances. Which load balancer should be used?
- A. Application Load Balancer
- B. Classic Load Balancer
- C. Gateway Load Balancer
- D. Network Load Balancer

<details><summary>Answer</summary>

**C.** Gateway Load Balancer uses GENEVE encapsulation to pass traffic transparently to the appliances.
Resource: <https://docs.aws.amazon.com/elasticloadbalancing/latest/gateway/introduction.html>
</details>

**24.** A company wants recommendations for right-sizing EC2 instances, EBS volumes, and Lambda memory based on usage metrics. Which service provides them?
- A. AWS Compute Optimizer
- B. AWS Config
- C. Amazon Inspector
- D. AWS Cost Explorer forecasts

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html>
</details>

---

## Task 3.3: Determine high-performing database solutions

**25.** A DynamoDB-backed game leaderboard needs microsecond read latency for heavily read items. What should be added?
- A. Global tables
- B. DynamoDB Accelerator (DAX)
- C. ElastiCache Memcached as a write-through cache managed by AWS
- D. DynamoDB Streams

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html>
</details>

**26.** A reporting workload is slowing down the primary Aurora writer. What is the BEST way to offload reads?
- A. Increase the writer instance to a larger instance class
- B. Use Backtrack to rewind the database after each report
- C. Add Aurora Replicas and point reports at the reader endpoint
- D. Run the reports from a Lambda function against the writer

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html>
</details>

**27.** A database has unpredictable, intermittent workloads and needs to scale capacity automatically in fine-grained increments. Which option fits?
- A. RDS on a fixed large instance
- B. Redshift provisioned
- C. Aurora Serverless v2
- D. RDS Custom

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html>
</details>

**28.** A company needs a petabyte-scale columnar data warehouse for complex SQL analytics. What should be used?
- A. Amazon Redshift
- B. Amazon Neptune
- C. DynamoDB
- D. Amazon RDS for PostgreSQL

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html>
</details>

**29.** A social network needs to query highly connected relationships (friends of friends). Which database fits?
- A. Amazon Keyspaces
- B. Amazon DocumentDB
- C. Amazon Timestream
- D. Amazon Neptune

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/neptune/latest/userguide/intro.html>
</details>

**30.** Match each workload to a purpose-built database. Which pairing is CORRECT?
- A. MongoDB-compatible documents → Keyspaces; Cassandra (CQL) → DocumentDB; IoT time series → Timestream
- B. MongoDB-compatible documents → Timestream; Cassandra (CQL) → Keyspaces; IoT time series → DocumentDB
- C. MongoDB-compatible documents → DocumentDB; Cassandra (CQL) → Neptune; IoT time series → Keyspaces
- D. MongoDB-compatible documents → DocumentDB; Cassandra (CQL) → Keyspaces; IoT time series → Timestream

<details><summary>Answer</summary>

**D.**
Resource: <https://aws.amazon.com/products/databases/>
</details>

**31.** A DynamoDB table gets throttled on a small number of keys even though total provisioned capacity isn't used up. What is the likely cause and fix?
- A. TTL is deleting items too slowly; lower the TTL values on the hot items
- B. A hot partition; choose a partition key with higher cardinality or add write sharding
- C. Global tables are disabled; add a replica Region to spread the writes
- D. The table is out of storage; request a storage quota increase for the table

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html>
</details>

**32.** A company needs an in-memory data store that supports complex data types, sorted sets, persistence, and replication with Multi-AZ failover. Which should it choose?
- A. ElastiCache for Redis OSS (or Valkey)
- B. ElastiCache for Memcached
- C. Amazon EFS with Elastic Throughput
- D. DynamoDB Accelerator (DAX)

<details><summary>Answer</summary>

**A.** Memcached is simple, multi-threaded, and has no persistence or replication.
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/SelectEngine.html>
</details>

---

## Task 3.4: Determine high-performing and/or scalable network architectures

**33.** A company serves static and dynamic content to global users and wants lower latency and less load on the origin. What should it use?
- A. A larger ALB
- B. Amazon CloudFront
- C. Route 53 simple routing
- D. AWS Global Accelerator for HTTP caching

<details><summary>Answer</summary>

**B.** CloudFront caches at edge locations. Global Accelerator doesn't cache.
Resource: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html>
</details>

**34.** A company has 50 VPCs and on-premises networks that all need to connect to each other. Managing peering is too complex. What is the BEST solution?
- A. AWS Transit Gateway (hub-and-spoke)
- B. A full mesh of VPC peering connections
- C. Internet gateways
- D. A NAT gateway in each VPC

<details><summary>Answer</summary>

**A.** VPC peering isn't transitive.
Resource: <https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html>
</details>

**35.** VPC A is peered with VPC B, and VPC B is peered with VPC C. Can VPC A reach VPC C through B?
- A. Yes, traffic is routed through VPC B automatically
- B. No, VPC peering doesn't support transitive routing
- C. Yes, if A's route table sends C's CIDR to the A–B peering
- D. Only for IPv6 traffic between the VPCs

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html>
</details>

**36.** A company needs a dedicated, consistent, high-bandwidth private connection (10 Gbps) from its data center to AWS. What should it use?
- A. Client VPN
- B. AWS Direct Connect
- C. An internet gateway
- D. Site-to-Site VPN

<details><summary>Answer</summary>

**B.** For encryption over DX, add IPsec VPN over DX or MACsec.
Resource: <https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html>
</details>

**37.** A company has several branch offices, each with its own Site-to-Site VPN connection to the same virtual private gateway. The branches must also be able to reach one another over those VPN connections. What should the company use?
- A. AWS VPN CloudHub, with a unique BGP ASN for each branch
- B. AWS PrivateLink interface endpoints for each branch office
- C. A Direct Connect transit virtual interface for each branch office
- D. VPC peering connections between the VPC and each branch office

<details><summary>Answer</summary>

**A.** CloudHub uses the virtual private gateway as a hub that routes traffic between the VPN connections. Each customer gateway needs its own BGP ASN. For large global networks, AWS Cloud WAN is the managed alternative.
Resource: <https://docs.aws.amazon.com/vpn/latest/s2svpn/VPN_CloudHub.html>
</details>

**38.** When designing a VPC, what is a key consideration for the CIDR block?
- A. Create one subnet that spans every AZ so that instances can move freely
- B. Avoid overlap with on-premises and other VPC CIDRs, and size subnets for growth
- C. Overlapping CIDRs are fine, because VPC peering translates addresses
- D. Always use /28 subnets so that each subnet wastes as few addresses as possible

<details><summary>Answer</summary>

**B.** AWS reserves 5 IP addresses in every subnet, and each subnet lives in exactly one AZ.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-cidr-blocks.html>
</details>

**39.** On-premises servers must resolve private Route 53 hosted-zone names, and VPC resources must resolve on-premises domains. What should be used?
- A. A CloudFront distribution with a Route 53 alias record
- B. Route 53 Resolver inbound and outbound endpoints with forwarding rules
- C. A DHCP options set that points the VPC at the on-premises DNS servers
- D. Public hosted zones that contain copies of the private records

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html>
</details>

**40.** A company wants to improve network performance between EC2 instances with up to 100+ Gbps and lower latency and jitter. What should it enable?
- A. Enhanced networking with ENA, plus EFA for HPC
- B. An Elastic IP address on each instance
- C. VPC Flow Logs with a 1-minute aggregation interval
- D. A NAT gateway in each Availability Zone

<details><summary>Answer</summary>

**A.** ENA supports up to 100+ Gbps on supported instance types, and EFA adds OS-bypass networking for MPI and HPC.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/enhanced-networking.html>
</details>

---

## Task 3.5: Determine high-performing data ingestion and transformation solutions

**41.** Clickstream data must be ingested in real time, processed by several consumers, and replayed for up to 7 days. What should be used?
- A. Amazon Kinesis Data Streams
- B. Amazon S3 event notifications
- C. Amazon SQS standard queue
- D. Amazon SNS standard topic

<details><summary>Answer</summary>

**A.** Retention can go up to 365 days. Multiple consumers can read the same stream, with enhanced fan-out available.
Resource: <https://docs.aws.amazon.com/streams/latest/dev/introduction.html>
</details>

**42.** A company wants to load streaming data into S3, Redshift, or OpenSearch in near real time, with optional Lambda transformation and format conversion to Parquet, with no administration. What fits?
- A. Amazon Data Firehose
- B. AWS Glue batch jobs
- C. AWS DataSync
- D. Kinesis Data Streams with custom consumers

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html>
</details>

**43.** Analysts want to run ad hoc SQL queries directly on CSV and Parquet files in S3 without loading them anywhere and pay per query. What should they use?
- A. Amazon RDS for PostgreSQL, after importing the files
- B. An Amazon Redshift provisioned cluster
- C. Amazon Athena with the AWS Glue Data Catalog
- D. An always-on Amazon EMR cluster running Hive

<details><summary>Answer</summary>

**C.** Partitioning and columnar formats reduce the data scanned, and so the cost.
Resource: <https://docs.aws.amazon.com/athena/latest/ug/what-is.html>
</details>

**44.** A company needs serverless ETL with automatic schema discovery (crawlers) and a central metadata catalog for its data lake. What should it use?
- A. Amazon EMR
- B. AWS Lambda only
- C. AWS Glue
- D. Amazon QuickSight

<details><summary>Answer</summary>

**C.** Lake Formation adds fine-grained permissions on top of the Glue Data Catalog.
Resource: <https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html>
</details>

**45.** A company must move 500 TB from its data center to S3 within a few weeks, but it has only a 100 Mbps internet link. What is the BEST option?
- A. AWS Snowball Edge devices
- B. Site-to-Site VPN
- C. S3 Transfer Acceleration
- D. AWS DataSync over the internet

<details><summary>Answer</summary>

**A.** Moving 500 TB over 100 Mbps would take more than a year. For online, ongoing transfers from NFS or SMB, DataSync is the right tool. The Transfer Family handles SFTP, FTPS, and FTP. (Snowball Edge is no longer available to new customers; AWS now points them to DataSync, AWS Data Transfer Terminal, or partner solutions. The exam still tests the offline-transfer concept.)
Resource: <https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html>
</details>
