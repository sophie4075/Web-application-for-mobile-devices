/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {MediaItem} from "../model/MyEntities.js";
import EditViewController from "./EditViewController";

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    items;
    addNewMediaItemElement;

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view

        this.addListener(new mwf.EventMatcher("crud", "created", "MediaItem"), ((event) => {
            this.addToListview(event.data);
        }));
        this.addListener(new mwf.EventMatcher("crud", "updated", "MediaItem"), ((event) => {
            this.updateInListview(event.data._id, event.data);
        }));

        this.addListener(new mwf.EventMatcher("crud", "deleted", "MediaItem"), ((event) => {
            this.removeFromListview(event.data);
        }));



        try {
            this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");

            this.addNewMediaItemElement.onclick = (() => {
                const newItem = new entities.MediaItem();
                this.nextView("editView", { item: newItem });
            });

            this.root.querySelector("footer .mwf-img-refresh").onclick = () => {

                if (this.application.currentCRUDScope === "local") {
                    this.application.switchCRUD("remote");

                } else {
                    this.application.switchCRUD("local");

                }
                entities.MediaItem.readAll().then((items) => {
                    this.initialiseListview(items);
                });

            }


            entities.MediaItem.readAll().then((items) => {
                this.initialiseListview(items);
            });


        } catch (error) {
            console.error("something went wrong :(");
        }


        await super.oncreate();
    }

    cloneItem(item) {
        const clonedItem = new entities.MediaItem(item.title, item.src);
        clonedItem._description = item._description;

        clonedItem.create().then(() => {
            console.log("Cloned :)");
        });
    }



    deleteItem(item) {
        item.delete();
    }


    showMediaItemDialog(item) {

        item.title = (item.title + item.title);


        this.showDialog('mediaItemDialog', {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => {
                        this.updateInListview(item._id, item);
                    });
                    this.hideDialog();
                }),
                deleteItem: ((event) => {
                    this.deleteItem(item);
                    this.hideDialog();

                })
            }
        })

    }

    showDeleteConfirmationDialog(item) {
        this.showDialog('mediaDeleteDialog', {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                        this.hideDialog();
                }),
                deleteItem: ((event) => {
                    this.deleteItem(item);
                    this.hideDialog();

                })
            }
        })
    }


    constructor() {
        super();

    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
  /* async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly

        if(returnStatus === "itemDeleted" && returnValue.item){
            this.removeFromListview(returnValue.item._id);
        }else if(returnStatus === "itemCreated" && returnValue.item){
            this.addToListview(returnValue.item);
        }else if( returnStatus === "itemUpdated" && returnValue.item){
            this.addToListview(returnValue.item);
        }

    }*/

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */

    /* bindListItemView(listviewid, itemview, itemobj) {
         // TODO: implement how attributes of itemobj shall be displayed in itemview
         itemview.root.querySelector("img").src = itemobj.src;
         itemview.root.querySelector("h2").textContent = itemobj.title + itemobj._id;
          itemview.root.querySelector("h3").textContent = itemobj.addedDateString;
     }*/

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
        this.nextView("mediaReadview", {item: itemobj});
    }


    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
        super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

}
