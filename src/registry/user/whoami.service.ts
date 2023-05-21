import { Inject, Provide } from "@midwayjs/core";
import { AppContext } from "../../interface";

@Provide()
export class WhoamiService {
    @Inject()
    ctx: AppContext;
    async userInfo() {
        this.ctx.status = 200;
        return {
            username: this.ctx.user.name,
        }
    }
}