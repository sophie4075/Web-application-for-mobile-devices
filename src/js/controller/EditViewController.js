/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {MediaItem} from "../model/MyEntities.js";
import VideoUtils from "../VideoUtils";

export default class EditViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view

        //this.addListener(new mwf.EventMatcher("crud","deleted","MediaItem"),((event) => {this.markAsObsolete();}),true);


        let mediaItem = this.args?.item || new entities.MediaItem();
        this.viewProxy = this.bindElement("EditViewTemplate", {item: mediaItem}, this.root).viewProxy;
        this.enAndDisableFileUpload();


        this.editViewForm = this.root.querySelector("main form");
        const video = this.root.querySelector("video");

        if(video){
            this.utils.setMediaPlayerPositionSaving(video);
        }


        this.viewProxy.bindAction("submitForm", () => {
            const formData = new FormData(document.getElementById("editForm"));
            mediaItem.src = formData.get("src");
            mediaItem.title = formData.get("title");
            mediaItem._description = formData.get("_description");



            if (this.editViewForm.srcimg.files[0]) {
                const requestResponsePairObj = new XMLHttpRequest();
                const baseUrl = "http://localhost:7077";
                const uploadUrl = baseUrl + "/api/upload";

                requestResponsePairObj.open("POST", uploadUrl);
                //const dataToBeUploaded = new FormData();
                formData.append("imgData", this.editViewForm.srcimg.files[0]);
                requestResponsePairObj.send(formData);

                requestResponsePairObj.onload = () => {
                    if (requestResponsePairObj.status === 200) {
                        const responseData = JSON.parse(requestResponsePairObj.responseText);
                        const uploadedImgRelativeUrl = responseData.data.imgData;
                        mediaItem.src = baseUrl + "/" + uploadedImgRelativeUrl;
                    } else {
                        alert("Error status on upload!: " + requestResponsePairObj.status)
                    }


                }

            }

            this.utils.pauseVideo(video);

            if (mediaItem.created) {
                mediaItem.update().then(() => {
                    this.notifyListeners(new mwf.Event("crud", "updated", "MediaItem", mediaItem._id));
                    this.previousView();
                });
            } else {
                mediaItem.create().then(() => {
                    this.previousView();
                });
            }

            return false;
        });

        this.viewProxy.bindAction("autoFill", () => {
            this.autofill();
            return false;
        });

        this.viewProxy.bindAction("deleteItem", () => {
            this.utils.pauseVideo(video);
            mediaItem.delete().then(() => {
                this.notifyListeners(new mwf.Event("crud", "deleted", "MediaItem", mediaItem._id));
                this.previousView(false);
            });
            return false;
        });


        this.editViewForm.srcimg.onchange = () => {

            const selectedFile = this.editViewForm.srcimg.files[0];
            const imageURL = document.getElementById('mediaURL');
            //temporäre Referenz
            const fileObjectUrl = URL.createObjectURL(selectedFile);
            imageURL.value = fileObjectUrl;
            mediaItem.src = fileObjectUrl;
            mediaItem.contentType = selectedFile.type;
            this.viewProxy.update({item: mediaItem});

            if (!mediaItem.created) {
                this.updateMediaPreview();
            }

        }

        document.getElementById('mediaURL').addEventListener('blur', () => {
            const url = document.getElementById('mediaURL').value;
            this.checkURLContentType(url).then(contentType => {
                mediaItem.src = url;
                mediaItem.contentType = contentType;

                this.viewProxy.update({item: mediaItem});

                if (!mediaItem.created) {
                    this.updateMediaPreview();
                }

            }).catch(error => {
                //alert('Leider ist ein Fehler beim Abrufen der URL aufgetreten: ' + error);
                console.log('Fehler beim Aufrufen der URL + error');
                mediaItem.src = url;
                this.viewProxy.update({item: mediaItem});

                if (!mediaItem.created) {
                    this.updateMediaPreview();
                }
            });
        });


        super.oncreate();

    }


    constructor() {
        super();
        this.utils = new VideoUtils();
    }

    autofill() {
        const imageURL = document.getElementById('mediaURL');
        const srcOptions = ["https://picsum.photos/100/100", "https://picsum.photos/50/50", "https://picsum.photos/125/125", "https://picsum.photos/75/75"]
        imageURL.value = srcOptions[Date.now() % srcOptions.length];

        this.updateMediaPreview();
    }


    updateMediaPreview() {
        const mediaURL = document.getElementById('mediaURL').value;

        const imagePreview = document.getElementById('imagePreview');
        const videoPreview = document.getElementById('videoPreview');

        if (imagePreview) {
            imagePreview.src = mediaURL;
            imagePreview.style.display = 'block';
            if (videoPreview != null && videoPreview.style.display === 'block') {
                videoPreview.style.display = 'none';
            }
        }

        if (videoPreview) {
            videoPreview.style.display = 'block';
            if (imagePreview != null && imagePreview.style.display === 'block') {
                imagePreview.style.display = 'none'
            }
        }


    }

    enAndDisableFileUpload() {
        let fileUploadButton = this.root.querySelector("#myapp-mediaMediaViewFormFileinput");
        let grayScaleButton = document.getElementById("disabledFileUpload");
        if (this.application.currentCRUDScope === "remote" && fileUploadButton.hasAttribute('disabled')) {
            fileUploadButton.toggleAttribute("disabled");
            grayScaleButton.classList.toggle("oos")
        } else if (this.application.currentCRUDScope === "local" && !fileUploadButton.hasAttribute('disabled')) {
            fileUploadButton.toggleAttribute("disabled");
            grayScaleButton.classList.toggle("oos")
        }
    }

    checkURLContentType(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, true);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const contentType = xhr.getResponseHeader('Content-Type');
                    resolve(contentType);
                } else {
                    this.tryGetRequest(url, resolve, reject);
                }
            };
            xhr.onerror = () => {
                this.tryGetRequest(url, resolve, reject);
            };
            xhr.send();
        });
    }

    tryGetRequest(url, resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
            if (xhr.status === 200) {
                const contentType = xhr.getResponseHeader('Content-Type');
                resolve(contentType);
            } else {
                reject('Die URL ist nicht erreichbar.');
            }
        };
        xhr.onerror = () => {
            reject('Fehler beim Abrufen der URL.');
        };
        xhr.send();
    }




    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    /*async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
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
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
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
