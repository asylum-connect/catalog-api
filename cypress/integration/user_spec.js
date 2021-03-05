/* eslint-disable no-undef */
/// <reference types="cypress" />

//Instantiate up Server variable
const port = process.env.PORT || 8080;
const url = process.env.HOST || `http://localhost:${port}`;
const filesPath = './cypress/temp_data';
const version = '/v1';

//compound url
let compoundURL = null;

//Routes Constants

//Routes constants
const route_user = '/users';
const route_users_count = '/users/count';
const route_users_list = '/lists';

describe('Users Routers', () => {
	it('GET - /v1/users - Get Users', () => {
		compoundURL = `${url}${version}${route_user}`;
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.users).to.be.an('array');
			expect(response.body.users).to.have.length.greaterThan(0);
			expect(response.body.users[0].isDataManager).to.be.an('boolean');
			expect(response.body.users[0].isProfessional).to.be.an('boolean');
			expect(response.body.users[0]._id).to.be.an('string');
			expect(response.body.users[0].name).to.be.an('string');
			expect(response.body.users[0].email).to.be.an('string');
		});
	});

	it('POST - /v1/users - Create User - New User', () => {
		compoundURL = `${url}${version}${route_user}`;
		cy.fixture('user_new.json').then((new_user) => {
			cy.request({
				method: 'POST',
				url: compoundURL,
				body: new_user
			}).should((response) => {
				expect(response.body.created).to.be.an('boolean');
				expect(response.body.created).to.be.eq(true);
				expect(response.body.userInfo.isDataManager).to.be.an('boolean');
				expect(response.body.userInfo.isDataManager).to.be.eq(false);
				expect(response.body.userInfo.isAdminDataManager).to.be.an('boolean');
				expect(response.body.userInfo.isAdminDataManager).to.be.eq(false);
				expect(response.body.userInfo.isProfessional).to.be.an('boolean');
				expect(response.body.userInfo.isProfessional).to.be.eq(false);
				expect(response.body.userInfo.name).to.be.an('string');
				expect(response.body.userInfo.email).to.be.an('string');
				expect(response.body.userInfo.age).to.be.an('string');
				expect(response.body.userInfo.ethnicityRace).to.be.an('array');
				expect(response.body.userInfo.ethnicityRace).to.be.lengthOf(0);
				expect(response.body.userInfo.identitySupplimental).to.be.an('array');
				expect(response.body.userInfo.identitySupplimental).to.be.lengthOf(0);
				expect(response.body.userInfo.lists).to.be.an('array');
				expect(response.body.userInfo.lists).to.be.lengthOf(0);
				//Save ID of User
				cy.writeFile(`${filesPath}/created_user.json`, response.body);
			});
		});
	});

	it('GET - /v1/users/count - Get User Count', () => {
		compoundURL = `${url}${version}${route_users_count}`;
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body).has.all.keys('count', 'pages');
			expect(response.body.count).to.be.greaterThan(0);
			expect(response.body.pages).to.be.greaterThan(0);
		});
	});

	it('GET - /v1/users/userId - Get User Id', () => {
		compoundURL = `${url}${version}${route_user}`;
		cy.readFile(`${filesPath}/created_user.json`).then((user) => {
			cy.request({
				method: 'GET',
				url: `${compoundURL}/${user.userInfo._id}`
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.isDataManager).to.be.an('boolean');
				expect(response.body.isDataManager).to.be.eq(false);
				expect(response.body.isAdminDataManager).to.be.an('boolean');
				expect(response.body.isAdminDataManager).to.be.eq(false);
				expect(response.body.isProfessional).to.be.an('boolean');
				expect(response.body.isProfessional).to.be.eq(false);
				expect(response.body.name).to.be.an('string');
				expect(response.body.email).to.be.an('string');
				expect(response.body.age).to.be.an('string');
				expect(response.body.ethnicityRace).to.be.an('array');
				expect(response.body.ethnicityRace).to.be.lengthOf(0);
				expect(response.body.identitySupplimental).to.be.an('array');
				expect(response.body.identitySupplimental).to.be.lengthOf(0);
				expect(response.body.lists).to.be.an('array');
				expect(response.body.lists).to.be.lengthOf(0);
			});
		});
	});

	it('POST - /v1/users - Create User - Existing User', () => {
		compoundURL = `${url}${version}${route_user}`;
		cy.fixture('user_new.json').then((new_user) => {
			cy.request({
				method: 'POST',
				url: compoundURL,
				body: new_user,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(409);
			});
		});
	});

	it('PATCH - /v1/users/:userId  - Patch User', () => {
		compoundURL = `${url}${version}${route_user}`;
		cy.fixture('user_new_update.json').then((new_user_update) => {
			cy.readFile(`${filesPath}/created_user.json`).then((user) => {
				cy.request({
					method: 'PATCH',
					url: `${compoundURL}/${user.userInfo._id}`,
					body: new_user_update
				}).should((response) => {
					//Verify positive response from server
					expect(response.status).to.be.eq(200);
					expect(response.body.updated).to.be.an('boolean');
					expect(response.body.updated).to.be.eq(true);
					//Get User using Commands and verify update was applied
					cy.getUser(user.userInfo._id).should((response) => {
						expect(response.body.name).to.be.an('string');
						expect(response.body.name).to.be.eq(new_user_update.name);
						expect(response.body.email).to.be.an('string');
						expect(response.body.email).to.be.eq(new_user_update.email);
						expect(response.body.age).to.be.an('string');
						expect(response.body.age).to.be.eq(new_user_update.age);
					});
				});
			});
		});
	});

	it('POST - /v1/users/:userid/lists - Add user lists', () => {
		cy.readFile(`${filesPath}/created_user.json`).then((user) => {
			compoundURL = `${url}${version}${route_user}/${user.userInfo._id}${route_users_list}`;
			cy.fixture('user_new_list.json').then((user_list) => {
				cy.request({
					method: 'POST',
					url: compoundURL,
					body: user_list
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.created).to.be.an('boolean');
					expect(response.body.created).to.be.eq(true);
					cy.getUser(user.userInfo._id).then((response) => {
						expect(response.body.lists[0].name).to.be.an('string');
						expect(response.body.lists[0].name).to.be.eq(user_list.name);
						//Save user with new list in it
						cy.writeFile(`${filesPath}/created_user_list.json`, response.body);
					});
				});
			});
		});
	});

	it('DELETE - /v1/users - Delete User', () => {
		compoundURL = `${url}${version}${route_user}`;
		cy.readFile(`${filesPath}/created_user.json`).then((user) => {
			cy.request({
				method: 'DELETE',
				url: `${compoundURL}/${user.userInfo._id}`
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.deleted).to.be.an('boolean');
				expect(response.body.deleted).to.be.eq(true);
			});
		});
	});

	after(() => {
		//Delete temp_data folder
		cy.exec(`rm -fr ${filesPath}`);
	});
});