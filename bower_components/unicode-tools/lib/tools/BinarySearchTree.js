/**
 * Binary Search Tree implementation in JavaScript
 *
 * Initially from https://github.com/nzakas/computer-science-in-javascript/blob/master/data-structures/binary-search-tree/binary-search-tree.js
 * Copyright (c) 2009 Nicholas C. Zakas
 *
 * Heavily changed though.
 */
define([], function () {
    "use strict";
    /**
     * A binary search tree implementation in JavaScript. This implementation
     * does not allow duplicate values to be inserted into the tree, ensuring
     * that there is just one instance of each value.
     * @class BinarySearchTree
     * @constructor
     */
    function BinarySearchTree() {

        /**
         * Pointer to root node in the tree.
         * @property _root
         * @type Object
         * @private
         */
        this._root = null;
    }

    var _p = BinarySearchTree.prototype;

    // attempt to create a nicely balanced tree from an ordered input list
    function BinarySearchTreeFromOrderedListFactory(input) {
        var tree = new BinarySearchTree()
          , lists = []
          , median, list, left, right
          ;
        if(input.length)
           lists.push(input);
        while( (list = lists.pop()) ) {
            median = (list.length/2) | 0; // right median for even length list

            tree.add(list[median]);
            left = list.slice(0, median);
            right = list.slice(median+1);

            if(left.length)
                lists.push(left);
            if(right.length)
                lists.push(right);
        }
        return tree;
    }

    BinarySearchTree.FromOrderedListFactory = BinarySearchTreeFromOrderedListFactory;

    //restore constructor
    _p.constructor = BinarySearchTree;

    /**
     * Appends some data to the appropriate point in the tree. If there are no
     * nodes in the tree, the data becomes the root. If there are other nodes
     * in the tree, then the tree must be traversed to find the correct spot
     * for insertion.
     * @param {variant} value The data to add to the list.
     * @return {Void}
     * @method add
     */
    _p.add = function (block) {
        var current, compared;

        //special case: no items in the tree yet
        if (this._root === null) {
            this._root = block;
            return;
        }
        current = this._root;
        while(true) {
            //if the new value is less than this node's value, go left
            compared = current.compare(block);
            if (compared < 0) {
                //if there's no left, then the new node belongs there
                if (current.left === null) {
                    current.left = block;
                    return;
                }
                current = current.left;
                continue;
            }
            //if the new value is greater than this node's value, go right
            if (compared > 0) {
                //if there's no right, then the new node belongs there
                if (current.right === null) {
                    current.right = block;
                    return;
                }
                current = current.right;
                continue;
            }
            throw new Error('Inserting an colliding or equivalent block is not allowed.');
        }
    };

    /**
     * Find the code block that contains unicode
     */
    _p.findBlock = function(unicode) {
        var found = false
          , current = this._root
          , compared
          , checked
          ;
        //make sure there's a node to search
        while(current) {
            //if the value is less than the current node's, go left
            checked = current.contains(unicode);
            if (checked < 0)
                current = current.left;
            else if (checked > 0)
                current = current.right;
            else
                return current;
        }
        return undefined;
    };

    return BinarySearchTree;
});
