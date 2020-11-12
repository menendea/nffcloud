  
//import  { exec } from 'child_process';
import { EOL } from 'os';
    
class NetUser{
    
    RE_KEY_VAL_PAIR = /^(\S+(?: \S+)*)(?:\s{2,}(\S.*)?)?$/;
    RE_DOMAIN_TITLE = /^The request will be processed at a domain controller for domain corp.netactica.com./;
    RE_TITLE = /^User accounts for /;
    RE_CLOSING = /^The command completed successfully./;
    RE_HR = /^-+$/;
    
    exec:any;

    constructor(exec:any){
        this.exec = exec;
    }
  
    usernames_depr(cb:Function) {
        return this.usernames(cb)
    }
  
    netUsers_depr(cb:Function) {
        return this.usernames(cb)
    }
  
    usernames(cb:Function) {
        
        let command = this.exec;
        command('net user', function(err, sout, serr) {
        
            if (err) cb(err);
    
            let lines = sout.split(EOL);
            let names = [];

            for (var i = 0; i < lines.length; i++) {
                if (lines[i] === '') continue;
                if (this.RE_TITLE.test(lines[i]) || this.RE_HR.test(lines[i])) continue;
                if (this.RE_CLOSING.test(lines[i])) break;
                names = names.concat(
                    lines[i].split(/\s+/).filter(function(v){ return v !== '' })
                );
            }
            return cb(null, names);

        }).once('error', function(err) {
            cb(err);
        });
    }

    netUser(userName:string, cb:Function) { 
        if (typeof cb !== 'function') {
            if (userName && typeof userName === 'function') {
                cb = userName; userName = undefined;
            }
        }
    
        if (!userName) return this.usernames(cb);
        return this.getUser(userName, 'domain',cb);
    }

    getUser(userName:string, userType:string, cb:Function) {

        let domain = '';

        if(userType !== 'local'){
            domain = '/DOMAIN';
        }

        let command = this.exec;
        command(`NET USER ${userName} ${domain}` , (err, sout, serr) => {
            if (err) {
                if (serr.indexOf('The user name could not be found.') != -1){
                    return cb(null, null);
                }
                return cb(err)
            }

            let data: any;
            try { 
                data = this.parseUserInfo(sout); 
            }
            catch (exc) { 
                return cb(exc); 
            }
            return cb(null, data);
    
        }).once('error', function(err) {
            cb(err);
        });
    }

    getAllUsers(cb:Function) {
   
        let list = [];
        this.usernames(function(err, names) {
        if (err) return cb(err)
        return fetchNext()
    
            function fetchNext() {
                if (names.length == 0) return cb(null, list)
        
                let command = this.exec;
                command('net user "' + names.shift() + '"', function(err, sout, serr) {
                if (err) return cb(err)
        
                try { list.push(this.parseUserInfo(sout)) }
                catch (exc) { return cb(exc) }
                return fetchNext()
        
                }).once('error', function(err) {
                cb(err)
                })
            }
        });
    }
  
    parseUserInfo(text:string) {

        let lines = text.split(EOL);
        let info = {
                global_groups:null,
                local_global:null,
                user_name:'',
                full_name:'',
                comment:'',
                usr_comment:'',
                script_path:'',
                country_code:'',
                acct_active:false,
                acct_expires:null,
                password_set:null,
                password_expires:null,
                password_changeable:null,
                password_required:false,
                password_can_change:false,
                workstations:null,
                profile:'',
                home_dir: '',
                last_logon:null,
                logon_hours:null,
                local_groups:null
        };
        
        let matches:any = null;
        let j:number;
    
        for (var i = 0; i < lines.length; i++) {
            if (lines[i] === '') continue;
            if (this.RE_DOMAIN_TITLE.test(lines[i]) || this.RE_HR.test(lines[i])) continue;
            if (this.RE_CLOSING.test(lines[i])) break;
            matches = lines[i].match(this.RE_KEY_VAL_PAIR);
            
            if (!matches) {
                continue
            }
        
            switch (matches[1]) {
                case "User name": info.user_name = matches[2]; break;
                case "Full Name": info.full_name = matches[2]; break;
                case "Comment":   info.comment = matches[2]; break;
                case "User's comment": info.usr_comment = matches[2]; break;
                case "Country code":
                    info.country_code = this.ctryCode(matches[2]); break;
                case "Account active":
                    info.acct_active = this.xlateBool(matches[2]); break;
                case "Account expires": 
                    info.acct_expires = this.xlateTimespec(matches[2]); break;
                case "Password last set":
                    info.password_set = this.xlateTimespec(matches[2]); break;
                case "Password expires":
                    info.password_expires = this.xlateTimespec(matches[2]); break;
                case "Password changeable":
                    info.password_changeable = this.xlateTimespec(matches[2]); break;
                case "Password required":
                    info.password_required = this.xlateBool(matches[2]); break;
                case "User may change password":
                    info.password_can_change = this.xlateBool(matches[2]); break;
                case "Workstations allowed":
                    info.workstations = this.parseWorkstnList(matches[2]); break;
                case "Logon script":   info.script_path = matches[2]; break;
                case "User profile":   info.profile = matches[2]; break;
                case "Home directory": info.home_dir = matches[2]; break;
                case "Last logon":
                    info.last_logon = this.xlateTimespec(matches[2]); break;
                case "Logon hours allowed":
                    if (matches[2] === 'All') { info.logon_hours = null; break; }
                    info.logon_hours = [];
                    if (matches[2] === 'None') break;
                    info.logon_hours.push(matches[2]);
                    for (j = i + 1; j < lines.length; j++) {
                        if (lines[j] === '') break;
                        let parts = lines[j].split(/\s\s+/)
                        if (parts[0]) break;
            
                        info.logon_hours.push(lines[j].trim())
                    }
                    i = j - 1; break;
        
                case "Local Group Memberships":
                    info.local_groups = this.parseGroupList(matches[2])
                    if (!info.local_groups || info.local_groups.length == 0) break;
                    
                    for (j = i + 1; j < lines.length; j++) {
                        if (lines[j] === '') break;
                        if (/^\s*\*/.test(lines[j]) === false) break;
                        info.local_groups = info.local_groups.concat(this.parseGroupList(lines[j]))
                    }
                    i = j - 1; break;
        
                case "Global Group memberships":
                    info.global_groups = this.parseGroupList(matches[2])
                    if (!info.global_groups || info.global_groups.length == 0) break;
                    for (j = i + 1; j < lines.length; j++) {
                        if (lines[j] === '') break;
                        if (/^\s*\*/.test(lines[j]) === false) break;
                        info.global_groups = info.global_groups.concat(this.parseGroupList(lines[j]))
                    }
                    i = j - 1; break;
            }
        }
        return info;
    }
  
    xlateBool(s:string) {
        switch (s) {
            case 'Yes': return true;
            case 'No' : return false;
        }
    }
  
    xlateTimespec(s:string) {
        if (s === 'Never') return null;
        
        let t = new Date(s)
        if (t.toString() === 'Invalid Date') {
            return null;
        }
        return t;
    }
  
    ctryCode(s:string) {
        if (!s || s === '(null)') return null;
        
        let matches = s.match(/^(\d{3})(?: .+)?$/);
    
        if (!matches) {
            return null;
        }

        return matches[1];
    }
  
    parseWorkstnList(s:string) {
        if (!s) return [];
        else if (s === 'All') return null;
        else return s.split(',');
    }
  
    parseGroupList(s:string) {
        let l:any[];
        if (!s) l = [];
        else {
            l = s.split(/\s*\*/g).filter(function(v:string){ return v !== '' });
            if (l.length) l[l.length - 1] = l[l.length - 1].trim();
            if (l[0] === 'None') l = [];
        }
        return l;
    }
  
}

export default NetUser;