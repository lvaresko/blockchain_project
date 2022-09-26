// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface InterfaceMdNFT is IERC721 {
    function mintValidTarget(address to, string memory uri) external returns(uint256);
    function burn(uint256 tokenId) external;
}