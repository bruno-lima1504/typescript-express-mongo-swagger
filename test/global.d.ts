import supertest from 'supertest'

declare global {
    var testRequest: supertest.Agent
}
