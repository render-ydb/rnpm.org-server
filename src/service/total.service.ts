import { Provide } from "@midwayjs/core";

@Provide()
export class TotalService {
    async showTotal(){
        return '显示所有信息'
    }
}