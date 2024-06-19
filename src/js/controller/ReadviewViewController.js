/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {MediaItem} from "../model/MyEntities";
import VideoUtils from "../VideoUtils";

export default class ReadviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    viewProxy;

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view


        this.addListener(new mwf.EventMatcher("crud", "deleted", "MediaItem"), ((event) => {
            this.markAsObsolete();
        }), true);

        this.addListener(new mwf.EventMatcher("crud", "updated", "MediaItem"), ((event) => {
            this.viewProxy.update({item : mediaItem});
        }));


        // call the superclass once creation is done
        let mediaItem = this.args.item;
        this.viewProxy = this.bindElement("mediaReadviewTemplate", {
            item: mediaItem
        }, this.root).viewProxy;

        let video = this.root.querySelector("video");

        this.viewProxy.bindAction("editItem", () => {
            this.utils.pauseVideo(video);
            this.nextView("editView", {item: mediaItem});
        });


        this.viewProxy.bindAction("deleteItem", () => {
            this.utils.pauseVideo(video);
            mediaItem.delete().then(() => {
                this.notifyListeners(new mwf.Event("crud", "deleted", "MediaItem", mediaItem._id));
                this.previousView();
            });
        });

        if(video){
            this.utils.setMediaPlayerPositionSaving(video);
        }

        this.viewProxy.bindAction("pause", () => {
            this.utils.pauseVideo(video);
        });


        super.oncreate();
    }


    constructor() {
        super();
        this.utils = new VideoUtils();
    }




    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
   /* async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly

        if( returnStatus === "itemUpdated" && returnValue.item){

            const titleElement = this.root.querySelector("h1");
            titleElement.textContent = returnValue.item.title;


            const imgElement = this.root.querySelector("img");
            imgElement.src = returnValue.item.src;


            const descriptionElement = this.root.querySelector("p");
            descriptionElement.textContent = returnValue.item._description;

        }

    }*/

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
    }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
        //this.nextView("editView", {item: itemobj});
    }





}

