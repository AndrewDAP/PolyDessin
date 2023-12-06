import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Image } from '@common/communication/image';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    constructor(private http: HttpClient) {}

    async saveImage(image: Image): Promise<void> {
        return this.http.post<void>(environment.SERVER_URL + '/save-image', image).toPromise();
    }

    async getImagesInfo(): Promise<Image[]> {
        return this.http.get<Image[]>(environment.SERVER_URL + '/get-images-info').toPromise();
    }

    async getImageData(id: string, title: string): Promise<Blob> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            // tslint:disable-next-line: object-literal-key-quotes : Conflict with tslint and prettier
            Accept: 'application/json',
        });

        return this.http
            .get<Blob>(`${environment.SERVER_URL}/get-image-data/${id}/${title}`, { headers, responseType: 'blob' as 'json' })
            .toPromise();
    }

    async removeImage(image: Image): Promise<void> {
        return this.http
            .post<void>(environment.SERVER_URL + '/remove-image', { id: image.id, title: image.title })
            .toPromise();
    }
}
