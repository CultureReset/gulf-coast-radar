/**
 * Blockchain Integration Module
 * Automatically records data syncs on Polygon for transparency
 * Handles all blockchain operations without requiring business owner wallets
 */

class BlockchainAudit {
  constructor() {
    // Polygon Mainnet configuration
    this.rpcUrl = 'https://polygon-rpc.com';
    this.contractAddress = null; // Will be set after deployment
    this.contractABI = [
      // recordSync function
      {
        "inputs": [
          {"internalType": "string", "name": "businessId", "type": "string"},
          {"internalType": "bytes32", "name": "dataHash", "type": "bytes32"},
          {"internalType": "string", "name": "dataType", "type": "string"}
        ],
        "name": "recordSync",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      // getSyncRecord function
      {
        "inputs": [{"internalType": "uint256", "name": "syncId", "type": "uint256"}],
        "name": "getSyncRecord",
        "outputs": [
          {"internalType": "string", "name": "businessId", "type": "string"},
          {"internalType": "bytes32", "name": "dataHash", "type": "bytes32"},
          {"internalType": "string", "name": "dataType", "type": "string"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "address", "name": "recorder", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
      },
      // getBusinessSyncs function
      {
        "inputs": [{"internalType": "string", "name": "businessId", "type": "string"}],
        "name": "getBusinessSyncs",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
      },
      // getLatestSync function
      {
        "inputs": [{"internalType": "string", "name": "businessId", "type": "string"}],
        "name": "getLatestSync",
        "outputs": [
          {"internalType": "uint256", "name": "syncId", "type": "uint256"},
          {"internalType": "bytes32", "name": "dataHash", "type": "bytes32"},
          {"internalType": "string", "name": "dataType", "type": "string"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
      },
      // verifyDataHash function
      {
        "inputs": [
          {"internalType": "string", "name": "businessId", "type": "string"},
          {"internalType": "bytes32", "name": "dataHash", "type": "bytes32"}
        ],
        "name": "verifyDataHash",
        "outputs": [
          {"internalType": "bool", "name": "exists", "type": "bool"},
          {"internalType": "uint256", "name": "syncId", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
      },
      // totalSyncs view
      {
        "inputs": [],
        "name": "totalSyncs",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      // Events
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "internalType": "uint256", "name": "syncId", "type": "uint256"},
          {"indexed": true, "internalType": "string", "name": "businessId", "type": "string"},
          {"indexed": false, "internalType": "bytes32", "name": "dataHash", "type": "bytes32"},
          {"indexed": false, "internalType": "string", "name": "dataType", "type": "string"},
          {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "DataSynced",
        "type": "event"
      }
    ];

    this.provider = null;
    this.contract = null;
    this.signer = null;
    this.pendingTransactions = new Map();
  }

  /**
   * Initialize blockchain connection
   * @param {string} contractAddress Deployed contract address
   * @param {string} privateKey Platform wallet private key (server-side only)
   */
  async initialize(contractAddress, privateKey = null) {
    this.contractAddress = contractAddress;

    // Connect to Polygon
    if (typeof ethers !== 'undefined') {
      this.provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);

      // Create read-only contract instance
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.provider
      );

      // If private key provided, setup signer (for writing)
      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
        this.contract = this.contract.connect(this.signer);
      }

      console.log('✅ Blockchain connection initialized');
      console.log(`📍 Contract: ${this.contractAddress}`);
    } else {
      console.error('❌ Ethers.js not loaded. Include: https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js');
    }
  }

  /**
   * Record a data sync on blockchain
   * @param {string} businessId Business identifier
   * @param {object} data Data that was synced
   * @param {string} dataType Type of data (menu, prices, hours, special)
   * @returns {Promise<object>} Transaction receipt with blockchain proof
   */
  async recordSync(businessId, data, dataType) {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Blockchain not initialized with signer');
      }

      // Hash the data
      const dataHash = await window.encryption.hashData(data);
      const dataHashBytes = '0x' + dataHash;

      console.log(`📝 Recording ${dataType} sync for ${businessId}...`);
      console.log(`📊 Data hash: ${dataHash}`);

      // Send transaction
      const tx = await this.contract.recordSync(
        businessId,
        dataHashBytes,
        dataType
      );

      console.log(`⏳ Transaction sent: ${tx.hash}`);
      this.pendingTransactions.set(tx.hash, {
        businessId,
        dataType,
        timestamp: Date.now()
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      // Extract sync ID from event
      const event = receipt.events?.find(e => e.event === 'DataSynced');
      const syncId = event?.args?.syncId.toString();

      // Remove from pending
      this.pendingTransactions.delete(tx.hash);

      return {
        success: true,
        syncId: syncId,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        dataHash: dataHash,
        polygonScanUrl: `https://polygonscan.com/tx/${receipt.transactionHash}`,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ Blockchain recording error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all syncs for a business
   * @param {string} businessId Business identifier
   * @returns {Promise<Array>} Array of sync records
   */
  async getBusinessSyncs(businessId) {
    try {
      if (!this.contract) {
        throw new Error('Blockchain not initialized');
      }

      const syncIds = await this.contract.getBusinessSyncs(businessId);

      const syncs = [];
      for (const syncId of syncIds) {
        const record = await this.contract.getSyncRecord(syncId);
        syncs.push({
          syncId: syncId.toString(),
          businessId: record.businessId,
          dataHash: record.dataHash,
          dataType: record.dataType,
          timestamp: new Date(record.timestamp.toNumber() * 1000),
          recorder: record.recorder
        });
      }

      return syncs;
    } catch (error) {
      console.error('Error fetching syncs:', error);
      return [];
    }
  }

  /**
   * Get latest sync for a business
   * @param {string} businessId Business identifier
   * @returns {Promise<object>} Latest sync record
   */
  async getLatestSync(businessId) {
    try {
      if (!this.contract) {
        throw new Error('Blockchain not initialized');
      }

      const result = await this.contract.getLatestSync(businessId);

      return {
        syncId: result.syncId.toString(),
        dataHash: result.dataHash,
        dataType: result.dataType,
        timestamp: new Date(result.timestamp.toNumber() * 1000)
      };
    } catch (error) {
      console.error('Error fetching latest sync:', error);
      return null;
    }
  }

  /**
   * Verify if current data matches blockchain record
   * @param {string} businessId Business identifier
   * @param {object} currentData Current data to verify
   * @returns {Promise<object>} Verification result
   */
  async verifyData(businessId, currentData) {
    try {
      // Hash current data
      const currentHash = await window.encryption.hashData(currentData);
      const currentHashBytes = '0x' + currentHash;

      // Check on blockchain
      const result = await this.contract.verifyDataHash(businessId, currentHashBytes);

      if (result.exists) {
        return {
          verified: true,
          syncId: result.syncId.toString(),
          timestamp: new Date(result.timestamp.toNumber() * 1000),
          message: 'Data verified on blockchain ✅'
        };
      } else {
        return {
          verified: false,
          message: 'Data not found on blockchain or has been modified ⚠️'
        };
      }
    } catch (error) {
      console.error('Verification error:', error);
      return {
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Get total number of syncs on the platform
   * @returns {Promise<number>} Total sync count
   */
  async getTotalSyncs() {
    try {
      if (!this.contract) {
        throw new Error('Blockchain not initialized');
      }

      const total = await this.contract.totalSyncs();
      return total.toNumber();
    } catch (error) {
      console.error('Error fetching total syncs:', error);
      return 0;
    }
  }

  /**
   * Get pending transactions
   * @returns {Array} Array of pending transactions
   */
  getPendingTransactions() {
    return Array.from(this.pendingTransactions.entries()).map(([hash, data]) => ({
      hash,
      ...data
    }));
  }

  /**
   * Format transaction for display
   * @param {object} receipt Transaction receipt
   * @returns {object} Formatted transaction info
   */
  formatTransaction(receipt) {
    return {
      title: '✅ Blockchain Verified',
      message: `Your data sync has been recorded on Polygon blockchain`,
      details: [
        `🆔 Sync ID: ${receipt.syncId}`,
        `🔗 Transaction: ${receipt.transactionHash.substring(0, 10)}...`,
        `📦 Block: ${receipt.blockNumber}`,
        `⛽ Gas Used: ${receipt.gasUsed}`,
        `🔍 View on PolygonScan: ${receipt.polygonScanUrl}`
      ]
    };
  }
}

// Create global instance
window.blockchainAudit = new BlockchainAudit();

/**
 * USAGE EXAMPLE:
 *
 * // Initialize (do this once on page load)
 * await blockchainAudit.initialize(
 *   '0x1234...', // Contract address
 *   'your-private-key' // Only on secure server
 * );
 *
 * // Record a menu sync
 * const menuData = { items: [...], prices: [...] };
 * const receipt = await blockchainAudit.recordSync(
 *   'lulus-gulf-shores',
 *   menuData,
 *   'menu'
 * );
 *
 * if (receipt.success) {
 *   console.log('Recorded on blockchain!');
 *   console.log('PolygonScan:', receipt.polygonScanUrl);
 * }
 *
 * // Verify current data
 * const verification = await blockchainAudit.verifyData(
 *   'lulus-gulf-shores',
 *   currentMenuData
 * );
 *
 * if (verification.verified) {
 *   console.log('Data verified!');
 * }
 *
 * // Get business sync history
 * const syncs = await blockchainAudit.getBusinessSyncs('lulus-gulf-shores');
 * console.log(`Found ${syncs.length} syncs`);
 */
