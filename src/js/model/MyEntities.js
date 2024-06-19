/**
 * @author Jörn Kreutel
 *
 * this skript defines the data types used by the application and the model operations for handling instances of the latter
 */

import {mwfUtils} from "vfh-iam-mwf-base";
import {EntityManager} from "vfh-iam-mwf-base";

/*************
 * example entity
 *************/

export class MyEntity extends EntityManager.Entity {

    // TODO-REPEATED: declare entity instance attributes

    constructor() {
        super();
    }

}

// TODO-REPEATED: add new entity class declarations here

export class MediaItem extends EntityManager.Entity {

    title;
    src;
    contentType;
    added = Date.now();
    _description = "";
    constructor(title, src, contentType) {
        super();
        this.title = title;
        this.src = src;
        this.contentType = contentType;

    }


    get addedDateString() {
        return new Date(this.added).toLocaleDateString();
    }
    get mediaType() {
        if (this.contentType) {
            let index = this.contentType.indexOf("/");
            if (index > -1) {
                return this.contentType.substring(0,index);
            }
            else {
                return "UNKNOWN";
            }
        }
        else {
            return "UNKNOWN";
        }
    }
}
