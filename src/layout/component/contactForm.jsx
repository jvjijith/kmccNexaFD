import React, { useState } from "react";

function ContactForm() {
  return (
    <div>
      <form>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Contact Name *&nbsp;
              </label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Your Customer Name"
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Email Address *&nbsp;
              </label>
              <input
                type="email"
                name="email"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Customer Email"
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Address *&nbsp;
              </label>
              <textarea
                name="address"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Customer Address ..."
                autoComplete="off"
                style={{ textAlign: "initial" }}
              ></textarea>
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Notes *&nbsp;
              </label>
              <textarea
                name="Notes"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Notes ..."
                autoComplete="off"
                style={{ textAlign: "initial" }}
              ></textarea>
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;State *&nbsp;
              </label>
              <input
                type="text"
                name="state"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Your State"
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Customer *&nbsp;
              </label>
              <select
                name="customer"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                style={{ textAlign: "initial" }}
              >
                <option value={"Live Streaming"}>Amazon</option>
                <option value={"Broadcast Media"}>Broadcast Media</option>
                <option value={"Healthcare"}>Healthcare</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Designation *&nbsp;
              </label>
              <input
                type="text"
                name="designation"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Your Designation"
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Country *&nbsp;
              </label>
              <input
                type="text"
                name="country"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Country"
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Primary PhoneNumber *&nbsp;
              </label>
              <input
                type="number"
                name="primaryPhoneNumber"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Your Phone Number"
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Secondary Phone Number *&nbsp;
              </label>
              <input
                type="number"
                name="secondaryPhoneNumber"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Phone Number"
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" name="primaryPhoneWhatsApp" />
                <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                <span className="ms-3 text-md font-medium text-white dark:text-white">
                  Whatsapp Available on Primary Phone Number
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" name="secondaryPhoneWhatsApp" />
                <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                <span className="ms-3 text-md font-medium text-white dark:text-white">
                  Whatsapp Available on Secondary Phone Number
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" name="decisionMaker" />
                <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                <span className="ms-3 text-md font-medium text-white dark:text-white">
                 Decision Maker
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>

       
        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button className="bg-nexa-orange hover:bg-green-400 text-white px-4 py-2 rounded">
            Add Contact
          </button>
        </div>
      </form>
    </div>
  );
}

export default ContactForm;
