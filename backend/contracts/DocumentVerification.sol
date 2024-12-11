// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentVerification {
    struct Document {
        string documentHash;
        address issuingAuthority;
        uint256 timestamp;
    }

    mapping(string => Document) public documentRegistry;

    // Store the document with a unique document hash
    function storeDocument(string memory uniqueID, string memory documentHash) public {
        documentRegistry[documentHash] = Document({
            documentHash: documentHash,
            issuingAuthority: msg.sender,
            timestamp: block.timestamp
        });
    }

    // Verify the document based on the document hash only
    function verifyDocument(string memory documentHash) public view returns (bool) {

        if (bytes(documentRegistry[documentHash].documentHash).length > 0) {
            return true; // Document is valid
        }
        return false; // Document is invalid
    }
}
