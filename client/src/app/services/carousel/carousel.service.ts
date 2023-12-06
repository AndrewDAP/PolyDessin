import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HTTP_SERVER_DISCONNECTED, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_SERVER_ERROR, NO_MATCH } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService } from '@app/services/filter/filter.service';
import { HttpService } from '@app/services/http/http.service';
import { LocationService } from '@app/services/location/location.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { Image } from '@common/communication/image';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CarouselService {
    private readonly MAX_CARDS: number = 3;
    private connectedToServer: boolean = true;

    cardsInfo: Image[] = [];
    filteredCardsInfo: Image[] = [];
    private readonly ERROR_IMAGE: Image = { title: 'error', tags: [''] };
    cardsAreLoading: boolean = false;
    tags: Set<string> = new Set();

    imagesById: Map<string, string | undefined> = new Map();

    private filteredCardsChanged: Subject<void> = new Subject<void>();

    constructor(
        private http: HttpService,
        private snackBarService: SnackBarService,
        private router: Router,
        private filterService: FilterService,
        private newDrawingService: NewDrawingService,
        private locationService: LocationService,
        private matDialog: MatDialog,
        private drawingService: DrawingService,
    ) {
        this.filterService.filterChangedListener().subscribe(() => this.updateFilteredCardsInfo());

        this.filterService.clearFilters();
    }

    get nextCardInfo(): Image {
        if (this.filteredCardsInfoLength <= this.MAX_CARDS) return this.ERROR_IMAGE;

        this.filteredCardsInfo.push(this.filteredCardsInfo.shift() as Image);
        return this.filteredCardsInfo[this.MAX_CARDS - 1];
    }
    get previousCardInfo(): Image {
        if (this.filteredCardsInfoLength <= this.MAX_CARDS) return this.ERROR_IMAGE;

        this.filteredCardsInfo.unshift(this.filteredCardsInfo.pop() as Image);
        return this.filteredCardsInfo[0];
    }

    get filteredCardsInfoLength(): number {
        return this.filteredCardsInfo.length;
    }

    filteredCardsChangedListener(): Observable<void> {
        return this.filteredCardsChanged.asObservable();
    }

    async getCardsInfo(showSnackBar: boolean): Promise<void> {
        this.cardsAreLoading = true;
        this.connectedToServer = true;
        return this.http
            .getImagesInfo()
            .then((cardsInfo) => this.setCardsInfo(cardsInfo))
            .catch((error) => {
                this.resetImagesInfo();
                this.connectedToServer = error.status;
                if (!showSnackBar) return;
                switch (error.status) {
                    case HTTP_SERVER_DISCONNECTED:
                        this.snackBarService.openSnackBar("Erreur de la requête de l'information des images. Le serveur est déconnecté.");
                        break;

                    case HTTP_STATUS_NOT_FOUND:
                        this.snackBarService.openSnackBar("Erreur de la requête de l'information des images. La base de donnée est déconnectée.");
                        break;

                    case HTTP_STATUS_SERVER_ERROR:
                        this.snackBarService.openSnackBar("Erreur de la requête de l'information des images. Erreur du serveur.");
                        break;
                    default:
                        this.snackBarService.openSnackBar("Erreur de la requête de l'information des images. Erreur inconnue.");
                        break;
                }
            });
    }

    async requestImage(id: string, title: string): Promise<string | undefined> {
        return this.http
            .getImageData(id, title)
            .then(async (blob: Blob) => {
                return await this.createImageFromBlob(id, blob);
            })
            .catch((error) => {
                switch (error.status) {
                    case HTTP_SERVER_DISCONNECTED:
                        this.snackBarService.openSnackBar("L'image n'a pas été trouvée, car le serveur est déconnecté.");
                        break;

                    case HTTP_STATUS_NOT_FOUND:
                        this.snackBarService.openSnackBar("L'image n'a pas été trouvée, car elle n'existe pas sur le serveur.");
                        break;

                    default:
                        this.snackBarService.openSnackBar("L'image n'a pas été trouvée, pour une raison inconnue");
                        break;
                }
                return undefined;
            });
    }

    // Source: https://medium.com/techinpieces/blobs-with-http-post-and-angular-5-a-short-story-993084811af4
    async createImageFromBlob(id: string, image: Blob): Promise<string | undefined> {
        const reader = new FileReader();

        reader.readAsDataURL(image);

        return new Promise((resolve) => {
            reader.addEventListener('load', () => {
                this.imagesById.set(id, reader.result as string);
                resolve(reader.result as string);
            });
        });
    }

    async getImage(id: string | undefined, title: string): Promise<string | undefined> {
        if (id === undefined) return undefined;
        if (this.imagesById.has(id)) return this.imagesById.get(id);
        else return await this.requestImage(id, title);
    }

    private setCardsInfo(cardsInfo: Image[]): void {
        this.cardsAreLoading = false;
        this.cardsInfo = cardsInfo as Image[];
        this.setTags();
    }

    resetImagesInfo(): void {
        this.cardsAreLoading = false;
        this.cardsInfo = [];
        this.filteredCardsInfo = [];
        this.tags = new Set();
        this.filterService.filters = [];
    }

    updateFilteredCardsInfo(): void {
        this.filteredCardsInfo =
            this.filterService.filters.length === 0
                ? this.cardsInfo
                : this.cardsInfo.filter((card) => card.tags.some((tag) => this.filterService.filters.indexOf(tag) !== NO_MATCH));
        this.filteredCardsChanged.next();
    }

    private setTags(): void {
        this.tags = new Set(([] as string[]).concat(...this.cardsInfo.map((tag) => tag.tags)));
        this.updateFilteredCardsInfo();
    }

    async canOpenDialog(): Promise<boolean> {
        await this.getCardsInfo(true);

        if (this.filteredCardsInfo.length === 0 && this.connectedToServer) this.snackBarService.openSnackBar('Le carrousel est vide.');

        return this.filteredCardsInfo.length !== 0;
    }

    async removeEntry(image: Image): Promise<void> {
        const id = image.id;

        if (id !== undefined) {
            return this.http
                .removeImage(image)
                .then(() => {
                    this.imagesById.delete(id);

                    const index = this.cardsInfo.indexOf(image);

                    if (index !== NO_MATCH) {
                        this.cardsInfo.splice(index, 1);
                        this.setTags();
                    }
                })
                .catch((error) => {
                    switch (error.status) {
                        case HTTP_SERVER_DISCONNECTED:
                            this.snackBarService.openSnackBar("L'image n'a pas pu être supprimée, car le serveur est déconnecté.");
                            break;

                        case HTTP_STATUS_SERVER_ERROR:
                            this.snackBarService.openSnackBar("L'image n'a pas pu être supprimée, car la base de donnée est déconnecté.");
                            break;

                        default:
                            this.snackBarService.openSnackBar("L'image n'a pas pu être supprimée, pour une raison inconnue.");
                            break;
                    }
                });
        }
    }

    load(url: string | undefined): void {
        if (url === undefined) return this.snackBarService.openSnackBar('Le dessin ne peut pas être chargé, veuillez en choisir un autre.');

        const HOME_URL = '/home';

        if (!(this.router.url === HOME_URL ? this.loadFromMainPage() : this.loadFromEditor())) return;

        const image = new Image();
        image.src = url;
        image.onload = () => this.newDrawingService.loadDrawing(image);

        this.matDialog.closeAll();
    }

    loadFromMainPage(): boolean {
        this.router.navigate(['/editor']);
        return (this.locationService.openEditorFromMainPage = true);
    }

    loadFromEditor(): boolean {
        return this.drawingService.isCanvasBlank() || confirm('Voulez-vous abandonner les changements du dessin en cours?');
    }
}
