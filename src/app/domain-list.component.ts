import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router'
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';

import { AuthService } from './services/auth.service';
import { RequestService } from './services/request.service';
import { IDlapResponse } from './models/dlap-response.model';

@Component({
  templateUrl: './domain-list.component.html',
  styleUrls: ['./domain-list.component.scss']
})

export class DomainListComponent implements OnInit {
  private domainResponse: IDlapResponse;

  constructor( private requestService: RequestService, private router: Router, private authService: AuthService, private http: Http, private cdRef:ChangeDetectorRef ) {

  }

  ngOnInit() {
    this.requestService.doRequest('listdomains', {domainid:0,limit:1000,select:"data"}).subscribe(
      data => this.domainResponse = data,
      resp => {
        //console.log("resp: ", resp )
      },
      () => {
        if(!!this.domainResponse && !!this.domainResponse.response && !! this.domainResponse.response.domains && !! this.domainResponse.response.domains.domain) {
          for(let domain of this.domainResponse.response.domains.domain) {
            /*  //  Demo request domain data (not needed)
            this.requestService.doRequest("getdomain2", {domainid: domain.id, select:"data"}).subscribe(
              data => {
                console.log(data);
              }
            );
            */
            domain.cq = false;
            if(!!domain.data && !!domain.data.customization) {
              if(!!domain.data.customization.customquestions) {
                domain.cq = true;
              }
              if(!!domain.data.customization.files && !!domain.data.customization.files.file && domain.data.customization.files.file instanceof Array)
                for(let file of domain.data.customization.files.file) {
                  if(file.type == "style") {
                    this.getDomainFile(domain.userspace, domain.id, file.path).subscribe(
                      data => {
                        this.parseStylesheetForLogo(data['_body'], domain);
                      }
                    );
                  }
                }
              else if(!!domain.data.customization.files && !!domain.data.customization.files.file && domain.data.customization.files instanceof Object) {
                let file = domain.data.customization.files.file;
                if(file.type == "style") {
                  this.getDomainFile(domain.userspace, domain.id, file.path).subscribe(
                    data => this.parseStylesheetForLogo(data['_body'], domain)
                  );
                }
              }
            }
          }
        }
        this.cdRef.detectChanges();
      }
    );
  }

  getDomainFile(domain: string, domainid: number, path: string): Observable<string> {
    return this.http.get("https://"+domain+".brainhoney.com/resource/"+domainid+"/"+path)
      .do( data => { } )
      .catch( this.error )
  }

  parseStylesheetForLogo(stylesheet: string, domain: any): void {
    let regExp = /[\r\n]\s*(?:div\.welcome_header\:(?:after|before)|\.top_right_header)[\w\W]*?\sbackground(?:-image)?:.*?url\(['"']?\.{0,2}\/?([^\"')]+)['"']?\)/i;
    let el = document.getElementById(domain.userspace);
    if(regExp.test(stylesheet))  {
      let img = regExp.exec(stylesheet)[1].replace(/^\//,"").replace(/\s/g,'%20');
      if(!!img && !(/(independentstudy|byuis|agilix)/i).test(img))
        el.style.backgroundImage = "url(https://"+domain.userspace+".brainhoney.com/resource/"+domain.id+"/"+img+")";
    }
  }

  private error(err: Response) {
    console.error(err)
    return Observable.throw(err.json().error || 'RequestService error')
  }

  getDomainLogoBackgroundStyle(domain: any): any {
    return {"background-image": "url(https://"+domain.userspace+".brainhoney.com/resource/"+domain.id+"/"+domain.titleBgImage+")"};
  }

  dummy(): void {

  }
}