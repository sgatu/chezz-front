import Api from "@/lib/api";
import { getContext } from "redux-saga/effects";

export const getApi = function*(): Generator<unknown, Api, unknown> {
  return (yield getContext("api")) as Api;
}

